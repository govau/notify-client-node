import HttpClient from "./http_client";
import { RequestPromise } from "request-promise";

export default class Client {
  httpClient: HttpClient;

  constructor(params: { apiKeyId: string; baseUrl?: string }) {
    this.httpClient = new HttpClient(params);
  }

  public sendEmail(
    templateId: string,
    emailAddress: string,
    options?: any
  ): any {
    options = options || {};
    const err = checkOptionsKeys(
      ["personalisation", "reference", "emailReplyToId"],
      options
    );
    if (err) {
      return Promise.reject(err);
    }
    const personalisation = options.personalisation || undefined;
    const reference = options.reference || undefined;
    const emailReplyToId = options.emailReplyToId || undefined;

    return this.httpClient.post(
      "/v2/notifications/email",
      createPayload(
        "email",
        templateId,
        emailAddress,
        personalisation,
        reference,
        emailReplyToId
      )
    );
  }

  public sendTextMessage(templateId: string, phoneNumber: string, options?: any): any {
    options = options || {};
    const err = checkOptionsKeys(
      ["personalisation", "reference", "smsSenderId"],
      options
    );
    if (err) {
      return Promise.reject(err);
    }

    const personalisation = options.personalisation || undefined;
    const reference = options.reference || undefined;
    const smsSenderId = options.smsSenderId || undefined;

    return this.httpClient.post(
      "/v2/notifications/sms",
      createPayload(
        "sms",
        templateId,
        phoneNumber,
        personalisation,
        reference,
        smsSenderId
      )
    );
  }

  public getNotificationById(notificationId: string): RequestPromise {
    return this.httpClient.get("/v2/notifications/" + notificationId);
  }

  public getNotifications(options?: {
    templateType?: string;
    status?: string;
    reference?: string;
    olderThanId?: string;
  }): RequestPromise {
    return this.httpClient.get(
      "/v2/notifications" + buildGetAllNotificationsQuery(options)
    );
  }

  public getTemplateById(templateId: string): RequestPromise {
    return this.httpClient.get("/v2/template/" + templateId);
  }

  public getTemplateByIdAndVersion(
    templateId: string,
    version: number
  ): RequestPromise {
    return this.httpClient.get(
      "/v2/template/" + templateId + "/version/" + version
    );
  }

  public getAllTemplates(templateType?: string): RequestPromise {
    let templateQuery = "";

    if (templateType) {
      templateQuery = "?type=" + templateType;
    }

    return this.httpClient.get("/v2/templates" + templateQuery);
  }

  public previewTemplateById(
    templateId: string,
    personalisation?: object
  ): RequestPromise {
    const payload: {
      personalisation?: any;
    } = {};

    if (personalisation) {
      payload.personalisation = personalisation;
    }

    return this.httpClient.post(
      "/v2/template/" + templateId + "/preview",
      payload
    );
  }

  public getReceivedTexts(olderThanId?: string): RequestPromise {
    let queryString: any = "";

    if (olderThanId) {
      queryString = "?older_than=" + olderThanId;
    }

    return this.httpClient.get(`/v2/received-text-messages${queryString}`);
  }

  public setProxy(url: string): void {
    this.httpClient.setProxy(url);
  }
}

const createPayload = (
  type: "email" | "sms",
  templateId: string,
  to: string,
  personalisation?: object,
  reference?: string,
  replyToId?: string
) => {
  const payload: {
    template_id: string;
    email_address?: string;
    phone_number?: string;
    personalisation?: object;
    reference?: string;
    email_reply_to_id?: string;
    sms_sender_id?: string;
  } = { template_id: templateId };

  if (type == "email") {
    payload.email_address = to;
  } else if (type == "sms") {
    payload.phone_number = to;
  }

  if (personalisation) {
    payload.personalisation = personalisation;
  }

  if (reference) {
    payload.reference = reference;
  }

  if (replyToId && type == "email") {
    payload.email_reply_to_id = replyToId;
  } else if (replyToId && type == "sms") {
    payload.sms_sender_id = replyToId;
  }

  return payload;
};

const buildGetAllNotificationsQuery = (options?: {
  templateType?: string;
  status?: string;
  reference?: string;
  olderThanId?: string;
}) => {
  if (!options) {
    return "";
  }

  const payload: {
    template_type?: string;
    status?: string;
    reference?: string;
    older_than?: string;
  } = {};

  if (options.templateType) {
    payload.template_type = options.templateType;
  }

  if (options.status) {
    payload.status = options.status;
  }

  if (options.reference) {
    payload.reference = options.reference;
  }

  if (options.olderThanId) {
    payload.older_than = options.olderThanId;
  }

  return buildQueryStringFromDict(payload);
};

const buildQueryStringFromDict = (dictionary: object) => {
  const queryString = Object.keys(dictionary)
    .map(key => [key, dictionary[key]].map(encodeURIComponent).join("="))
    .join("&");

  return queryString ? "?" + queryString : "";
};

const checkOptionsKeys = (allowedKeys: Array<string>, options: object) => {
  const invalidKeys = Object.keys(options).filter(
    keyName => !allowedKeys.includes(keyName)
  );

  if (invalidKeys.length) {
    const message =
      "NotifyClient now uses an options configuration object. Options " +
      JSON.stringify(invalidKeys) +
      " not recognised. Please refer to the README.md for more information on method signatures.";
    return new Error(message);
  }
  return null;
};
