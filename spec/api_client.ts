import { expect } from 'chai';
import MockDate from 'mockdate';
import ApiClient from '../src/api_client';
import nock from 'nock';
import { createGovAuNotifyToken } from '../src/authentication';
import packageJson from '../package.json';

const version = packageJson.version;

describe('api client', function () {

  const serviceId = 'c745a8d8-b48a-4b0d-96e5-dbea0165ebd1';
  const secret = '8b3aa916-ec82-434e-b0c5-d5d9b371d6a3';
  const apiKeyId1 = 'key_name' + '-' + serviceId + '-' + secret;
  const apiKeyId2 = 'key_name' + ':' + serviceId + ':' + secret;

  beforeEach(function() {
    MockDate.set(1234567890000);
  });

  afterEach(function() {
    MockDate.reset();
  });

  it('should make a get request with correct headers', function (done) {

    const baseUrl = 'https://rest-api.notify.gov.au';
    const path = '/email';
    const body = { 'body': 'body text' };

    [
      new ApiClient({ baseUrl, apiKeyId: apiKeyId1 }),
      new ApiClient({ apiKeyId: apiKeyId2 })
    ].forEach(function(client, index, clients) {

      nock(baseUrl, {
        reqheaders: {
          'Authorization': 'Bearer ' + createGovAuNotifyToken(secret, serviceId),
          'User-agent': 'NOTIFY-API-NODE-CLIENT/' + version
        }
      })
        .get(path)
        .reply(200, body);

      client.get(path)
        .then(function (response) {
          expect(response.body).to.deep.equal(body);
          if (index == clients.length - 1) done();
      });

    });

  });

  it('should make a post request with correct headers', function (done) {

    var baseUrl = 'http://localhost',
      path = '/email',
      data = {
        'data': 'qwjjs'
      };

    nock(baseUrl, {
      reqheaders: {
        'Authorization': 'Bearer ' + createGovAuNotifyToken(secret, serviceId),
        'User-agent': 'NOTIFY-API-NODE-CLIENT/' + version
      }
    })
      .post(path, data)
      .reply(200, {"hooray": "bkbbk"});

    const apiClient = new ApiClient({ baseUrl, apiKeyId: apiKeyId1 });
    apiClient.post(path, data)
      .then(function (response) {
        expect(response.statusCode).to.equal(200);
        done();
    });
  });

  it('should direct get requests through the proxy when set', function (done) {
    var baseUrl = 'https://rest-api.notify.gov.au',
      proxyUrl = 'http://proxy.service.gov.au:3030/',
      path = '/email',
      apiClient = new ApiClient({ baseUrl, apiKeyId: 'apiKey' });

    nock(baseUrl)
      .get(path)
      .reply(200, 'test');

    apiClient.setProxy(proxyUrl);
    apiClient.get(path)
      .then(function (response) {
        expect(response.statusCode).to.equal(200);
        expect(response.request.proxy.href).to.equal(proxyUrl);
        done();
    });
  });

  it('should direct post requests through the proxy when set', function (done) {
    var baseUrl = 'https://rest-api.notify.gov.au',
      proxyUrl = 'http://proxy.service.gov.au:3030/',
      path = '/email',
      apiClient = new ApiClient({ baseUrl, apiKeyId: apiKeyId1 });

    nock(baseUrl)
      .post(path)
      .reply(200, 'test');

    apiClient.setProxy(proxyUrl);
    apiClient.post(path)
      .then(function (response) {
        expect(response.statusCode).to.equal(200);
        expect(response.request.proxy.href).to.equal(proxyUrl);
        done();
    });
  });
});
