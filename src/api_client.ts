import restClient, {Options, RequestPromise} from 'request-promise';
import { createGovAuNotifyToken } from './authentication';
import packageJson from '../package.json';

export default class NotifyClient {

  proxy: string;
  baseUrl: string = 'https://rest-api.notify.gov.au';
  secret: string;
  serviceId: string;

  constructor(params: {apiKeyId: string, baseUrl?: string}) {

    if (params.baseUrl) {
      this.baseUrl = params.baseUrl;
    }

    this.serviceId = this.getServiceIdFromApiKey(params.apiKeyId);
    this.secret = this.getRealApiKeyFromApiKey(params.apiKeyId);
  }


  /**
   * @param {string} path
   *
   * @returns {Promise}
   */
  public get(path: string): RequestPromise {
    const options : Options = {
      method: 'GET',
      uri: this.baseUrl + path,
      json: true,
      resolveWithFullResponse: true,
      headers: this.getHeader()
    };

    if(this.proxy !== null) {
      options.proxy = this.proxy;
    }

    return restClient(options);
  }

  /**
   * @param {string} path
   * @param {object} data
   *
   * @returns {Promise}
   */
  public post(path: string, data?: object): RequestPromise {
    const options : Options = {
      method: 'POST',
      uri: this.baseUrl + path,
      json: true,
      body: data,
      resolveWithFullResponse: true,
      headers: this.getHeader()
    };

    if(this.proxy !== null) {
      options.proxy = this.proxy;
    }

    return restClient(options);
  }

  /**
   * @param {String} url
   */
  public setProxy(url: string) {
    this.proxy = url;
  }

  private getHeader(): object {
    return {
      'Authorization': 'Bearer ' + createGovAuNotifyToken(this.secret, this.serviceId),
      'User-agent': 'NOTIFY-API-NODE-CLIENT/' + packageJson.version
    };
  }

  private getServiceIdFromApiKey(apiKeyId: string): string {
    return apiKeyId.substring(Math.max(0, apiKeyId.length - 73), Math.max(0, apiKeyId.length - 37));
  }

  private getRealApiKeyFromApiKey(apiKeyId: string): string {
    return apiKeyId.substring(Math.max(0, apiKeyId.length - 36));
  }
}

