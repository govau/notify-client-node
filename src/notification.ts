import ApiClient from './api_client';
import { RequestPromise } from "request-promise";

export default class NotifyClient {

  apiClient: ApiClient;

  constructor(params: {apiKeyId: string, baseUrl?: string}) {
    this.apiClient = new ApiClient(params);
  }


    /**
     * Usage:
     *
     * notifyClient = new NotifyClient({ apiKeyId, baseUrl });
     *
     * notifyClient.sendEmail(templateId, email, personalisation)
     *    .then(function (response) {
     *       //do stuff with response
     *     })
     *     .catch(function (error) {
     *       //deal with errors here
     *     });
     *
     *
     * @param {String} templateId
     * @param {String} emailAddress
     * @param {Object} options
     *
     * @returns {Promise}
     */
    public sendEmail(templateId: string, emailAddress: string, options?: any): any {
      options = options || {};
      const err = checkOptionsKeys(['personalisation', 'reference', 'emailReplyToId'], options);
      if (err) {
        return Promise.reject(err);
      }
      const personalisation = options.personalisation || undefined;
      const reference = options.reference || undefined;
      const emailReplyToId = options.emailReplyToId || undefined;

      return this.apiClient.post('/v2/notifications/email',
        createNotificationPayload('email', templateId, emailAddress, personalisation, reference, emailReplyToId));
    }

    /**
     *
     * @param {String} templateId
     * @param {String} phoneNumber
     * @param {Object} options
     *
     * @returns {Promise}
     */
    public sendSms(templateId: string, phoneNumber: string, options?: any): any {
      options = options || {};
      const err = checkOptionsKeys(['personalisation', 'reference', 'smsSenderId'], options);
      if (err) {
        return Promise.reject(err);
      }

      const personalisation = options.personalisation || undefined;
      const reference = options.reference || undefined;
      const smsSenderId = options.smsSenderId || undefined;

      return this.apiClient.post('/v2/notifications/sms',
        createNotificationPayload('sms', templateId, phoneNumber, personalisation, reference, smsSenderId));
    }

    /**
     *
     * @param {String} notificationId
     *
     * @returns {Promise}
     */
    public getNotificationById(notificationId: string): RequestPromise {
      return this.apiClient.get('/v2/notifications/' + notificationId);
    }

    /**
     *
     * @param {Object} An optional object literal that filters the query. Accepts the following filters:
     *    @param {String} templateType
     *    @param {String} status
     *    @param {String} reference
     *    @param {String} olderThanId
     *
     * @returns {Promise}
     *
     */
    public getNotifications(options?: { templateType?: string, status?: string, reference?: string, olderThanId?: string }): RequestPromise {
      return this.apiClient.get('/v2/notifications' + buildGetAllNotificationsQuery(options));
    }

    /**
     *
     * @param {String} templateId
     *
     * @returns {Promise}
     */
    public getTemplateById(templateId: string): RequestPromise {
      return this.apiClient.get('/v2/template/' + templateId);
    }

    /**
     *
     * @param {String} templateId
     * @param {Integer} version
     *
     * @returns {Promise}
     */
    public getTemplateByIdAndVersion(templateId, version): RequestPromise {
      return this.apiClient.get('/v2/template/' + templateId + '/version/' + version);
    }

    /**
     *
     * @param {String} templateType
     *
     * @returns {Promise}
     */
    public getAllTemplates(templateType?: string): RequestPromise {
        let templateQuery = '';

        if (templateType) {
          templateQuery = '?type=' + templateType;
        }

        return this.apiClient.get('/v2/templates' + templateQuery);
    }

    /**
     *
     * @param {String} templateId
     * @param {Dictionary} personalisation
     *
     * @returns {Promise}
     */
    public previewTemplateById(templateId: string, personalisation?: any): RequestPromise {

        let payload: any = {};

        if (personalisation) {
          payload.personalisation = personalisation;
        }

        return this.apiClient.post('/v2/template/' + templateId +  '/preview', payload);
    }

    /**
     *
     * @param {String} olderThanId
     *
     * @returns {Promise}
     */
    public getReceivedTexts(olderThanId?: string): RequestPromise {
      let queryString: any = '';

      if (olderThanId) {
        queryString = '?older_than=' + olderThanId;
      }

      return this.apiClient.get('/v2/received-text-messages' + queryString);
    }

    /**
     *
     * @param {String} url
     */
    public setProxy(url: string): void {
        this.apiClient.setProxy(url);
    }
}

/**
 *
 * @param {String} type
 * @param {String} templateId
 * @param {String} to
 * @param {Object} personalisation
 * @param {String} reference
 * @param {String} replyToId
 *
 * @returns {Object}
 */
function createNotificationPayload(type, templateId, to, personalisation, reference, replyToId) {

  var payload: any = {
    template_id: templateId
  };

  if (type == 'email') {
    payload.email_address = to;
  } else if (type == 'sms') {
    payload.phone_number = to;
  }

  if (personalisation) {
    payload.personalisation = personalisation;
  }

  if (reference) {
    payload.reference = reference;
  }

  if (replyToId && type == 'email') {
    payload.email_reply_to_id = replyToId;
  } else if (replyToId && type == 'sms') {
    payload.sms_sender_id = replyToId;
  }

  return payload;
}

/**
 *
 * @param {String} templateType
 * @param {String} status
 * @param {String} reference
 * @param {String} olderThanId
 *
 * @returns {String}
 */
function buildGetAllNotificationsQuery(options?: { templateType?: string, status?: string, reference?: string, olderThanId?: string }) {

  if (!options) {
    return '';
  }

  let payload: any = {};

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
}

function buildQueryStringFromDict(dictionary: object) {
  const queryString = Object.keys(dictionary).map(function(key) {
    return [key, dictionary[key]].map(encodeURIComponent).join("=");
  }).join('&');

  return queryString ? '?' + queryString : '';
}

function checkOptionsKeys(allowedKeys: any, options: object) {
  let invalidKeys = Object.keys(options).filter((key_name) =>
    !allowedKeys.includes(key_name)
  );

  if (invalidKeys.length) {
    const err_msg = (
      'NotifyClient now uses an options configuration object. Options ' + JSON.stringify(invalidKeys) +
      ' not recognised. Please refer to the README.md for more information on method signatures.'
    );
    return new Error(err_msg);
  }
  return null;
}
