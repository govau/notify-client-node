import restClient, { Options, RequestPromise } from "request-promise";
import { createJwtToken } from "./authentication";
import packageJson from "../package.json";

const secretKeyLength = 36;
const lengthOfDash = 1;
const lengthOfApiKey = 73;

const getServiceIdFromApiKey = (apiKeyId: string): string => {
  return apiKeyId.substring(
    Math.max(0, apiKeyId.length - lengthOfApiKey),
    Math.max(0, apiKeyId.length - (secretKeyLength + lengthOfDash))
  );
};

const getSecretFromApiKey = (apiKeyId: string): string => {
  return apiKeyId.substring(Math.max(0, apiKeyId.length - secretKeyLength));
};

export default class HttpClient {
  proxy: string;
  baseUrl: string = "https://rest-api.notify.gov.au";
  secret: string;
  serviceId: string;

  constructor(params: { apiKeyId: string; baseUrl?: string }) {
    if (params.baseUrl) {
      this.baseUrl = params.baseUrl;
    }

    this.serviceId = getServiceIdFromApiKey(params.apiKeyId);
    this.secret = getSecretFromApiKey(params.apiKeyId);
  }

  public get(path: string): RequestPromise {
    const options: Options = {
      method: "GET",
      uri: this.baseUrl + path,
      json: true,
      resolveWithFullResponse: true,
      headers: this.getHeader()
    };

    if (this.proxy !== null) {
      options.proxy = this.proxy;
    }

    return restClient(options);
  }

  public post(path: string, data?: object): RequestPromise {
    const options: Options = {
      method: "POST",
      uri: this.baseUrl + path,
      json: true,
      body: data,
      resolveWithFullResponse: true,
      headers: this.getHeader()
    };

    if (this.proxy !== null) {
      options.proxy = this.proxy;
    }

    return restClient(options);
  }

  public setProxy(url: string) {
    this.proxy = url;
  }

  private getHeader(): object {
    return {
      Authorization: "Bearer " + createJwtToken(this.secret, this.serviceId),
      "User-agent": "NOTIFY-API-NODE-CLIENT/" + packageJson.version
    };
  }
}
