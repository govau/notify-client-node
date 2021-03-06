import HttpClient from "./http_client";
import { RequestPromise } from "request-promise";

export default class Client {
  httpClient: HttpClient;

  constructor(params: { apiKey: string; baseUrl?: string }) {
    this.httpClient = new HttpClient({
      apiKeyId: params.apiKey,
      baseUrl: params.baseUrl,
    });
  }

  public sendEmail(
    templateId: string,
    emailAddress: string,
    options?: any
  ): Promise<any> {
    options = options || {};
    const err = checkOptionsKeys(
      [
        "personalisation",
        "reference",
        "emailReplyToId",
        "statusCallbackUrl",
        "statusCallbackBearerToken"
      ],
      options
    );
    if (err) {
      return Promise.reject(err);
    }

    const personalisation = options.personalisation || undefined;
    const reference = options.reference || undefined;
    const emailReplyToId = options.emailReplyToId || undefined;
    const statusCallbackUrl = options.statusCallbackUrl || undefined;
    const statusCallbackBearerToken =
      options.statusCallbackBearerToken || undefined;

    return Promise.resolve<RequestPromise>(this.httpClient.post(
      "/v2/notifications/email",
      createPayload(
        "email",
        templateId,
        emailAddress,
        personalisation,
        reference,
        emailReplyToId,
        statusCallbackUrl,
        statusCallbackBearerToken
      )
    ));
  }

  public sendSms(templateId: string, phoneNumber: string, options?: any): Promise<any> {
    options = options || {};
    const err = checkOptionsKeys(
      [
        "personalisation",
        "reference",
        "smsSenderId",
        "statusCallbackUrl",
        "statusCallbackBearerToken"
      ],
      options
    );
    if (err) {
      return Promise.reject(err);
    }

    const personalisation = options.personalisation || undefined;
    const reference = options.reference || undefined;
    const smsSenderId = options.smsSenderId || undefined;
    const statusCallbackUrl = options.statusCallbackUrl || undefined;
    const statusCallbackBearerToken =
      options.statusCallbackBearerToken || undefined;

    return Promise.resolve<RequestPromise>(this.httpClient.post(
      "/v2/notifications/sms",
      createPayload(
        "sms",
        templateId,
        phoneNumber,
        personalisation,
        reference,
        smsSenderId,
        statusCallbackUrl,
        statusCallbackBearerToken
      )
    ));
  }

  public getNotificationById(notificationId: string): RequestPromise {
    return this.httpClient.get("/v2/notifications/" + notificationId);
  }

  public getNotifications(options?: {
    templateId?: string;
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
  replyToId?: string,
  statusCallbackUrl?: string,
  statusCallbackBearerToken?: string
) => {
  const payload: {
    template_id: string;
    email_address?: string;
    phone_number?: string;
    personalisation?: object;
    reference?: string;
    email_reply_to_id?: string;
    sms_sender_id?: string;
    status_callback_url?: string;
    status_callback_bearer_token?: string;
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

  if (statusCallbackUrl) {
    payload.status_callback_url = statusCallbackUrl;
  }

  if (statusCallbackBearerToken) {
    payload.status_callback_bearer_token = statusCallbackBearerToken;
  }

  return payload;
};

const buildGetAllNotificationsQuery = (options?: {
  templateId?: string;
  templateType?: string;
  status?: string;
  reference?: string;
  olderThanId?: string;
}) => {
  if (!options) {
    return "";
  }

  const payload: {
    template_id?: string;
    template_type?: string;
    status?: string;
    reference?: string;
    older_than?: string;
  } = {};

  if (options.templateId) {
    payload.template_id = options.templateId;
  }

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

  const queryString = buildQueryStringFromDict(payload);

  return queryString;
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
