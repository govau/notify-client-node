import { expect } from "chai";
import MockDate from "mockdate";
import nock from "nock";

import NotifyClient from "../src/client";
import { createJwtToken } from "../src/authentication";

MockDate.set(1234567890000);

const baseUrl = "http://localhost";
const serviceId = "c745a8d8-b48a-4b0d-96e5-dbea0165ebd1";
const secret = "8b3aa916-ec82-434e-b0c5-d5d9b371d6a3";
const apiKey = `testkey-${serviceId}-${secret}`;

function getNotifyClient() {
  let baseUrl = "http://localhost";
  let notifyClient = new NotifyClient({ baseUrl, apiKey });
  return notifyClient;
}

function getNotifyAuthNock() {
  const notifyNock = nock(baseUrl, {
    reqheaders: {
      Authorization: "Bearer " + createJwtToken(secret, serviceId)
    }
  });
  return notifyNock;
}

describe("notification api", () => {
  beforeEach(() => {
    MockDate.set(1234567890000);
  });

  afterEach(() => {
    MockDate.reset();
  });

  let notifyClient = getNotifyClient();
  let notifyAuthNock = getNotifyAuthNock();

  describe("sendEmail", () => {
    it("should send an email", () => {
      let email = "dom@example.com",
        templateId = "123",
        options = {
          personalisation: { foo: "bar" }
        },
        data = {
          template_id: templateId,
          email_address: email,
          personalisation: options.personalisation
        };

      notifyAuthNock
        .post("/v2/notifications/email", data)
        .reply(200, { hooray: "bkbbk" });

      return notifyClient
        .sendEmail(templateId, email, options)
        .then(response => {
          expect(response.statusCode).to.equal(200);
          expect(response.body.hooray).to.equal("bkbbk");
        });
    });

    it("should send an email with email_reply_to_id", () => {
      let email = "dom@example.com",
        templateId = "123",
        options = {
          personalisation: { foo: "bar" },
          emailReplyToId: "456"
        },
        data = {
          template_id: templateId,
          email_address: email,
          personalisation: options.personalisation,
          email_reply_to_id: options.emailReplyToId
        };

      notifyAuthNock
        .post("/v2/notifications/email", data)
        .reply(200, { hooray: "bkbbk" });

      return notifyClient
        .sendEmail(templateId, email, options)
        .then(response => {
          expect(response.statusCode).to.equal(200);
          expect(response.body.hooray).to.equal("bkbbk");
        });
    });

    it("should send an email with status callback url and bearer token", () => {
      let email = "dom@example.com",
        templateId = "123",
        options = {
          personalisation: { foo: "bar" },
          statusCallbackUrl: "https://localhost/callback",
          statusCallbackBearerToken: "1234567890"
        },
        data = {
          template_id: templateId,
          email_address: email,
          personalisation: options.personalisation,
          status_callback_url: options.statusCallbackUrl,
          status_callback_bearer_token: options.statusCallbackBearerToken
        };

      notifyAuthNock
        .post("/v2/notifications/email", data)
        .reply(200, { hooray: "bkbbk" });

      return notifyClient
        .sendEmail(templateId, email, options)
        .then(response => {
          expect(response.statusCode).to.equal(200);
          expect(response.body.hooray).to.equal("bkbbk");
        });
    });

    it("should reject options dicts with unknown options", () => {
      let email = "foo@bar.com",
        templateId = "123",
        // old personalisation dict
        options = {
          firstname: "Fred",
          surname: "Smith",
          reference: "ABC123"
        };
      return notifyClient
        .sendEmail(templateId, email, options)
        .catch(err =>
          expect(err.message).to.include('["firstname","surname"]')
        );
    });
  });

  describe("sendSms", () => {
    it("should send an sms", () => {
      let phoneNo = "07525755555",
        templateId = "123",
        options = {
          personalisation: { foo: "bar" }
        },
        data = {
          template_id: templateId,
          phone_number: phoneNo,
          personalisation: options.personalisation
        };

      notifyAuthNock
        .post("/v2/notifications/sms", data)
        .reply(200, { hooray: "bkbbk" });

      return notifyClient
        .sendSms(templateId, phoneNo, options)
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
          expect(response.body.hooray).to.equal("bkbbk");
        });
    });

    it("should send an sms with smsSenderId", () => {
      let phoneNo = "07525755555",
        templateId = "123",
        options = {
          personalisation: { foo: "bar" },
          smsSenderId: "456"
        },
        data = {
          template_id: templateId,
          phone_number: phoneNo,
          personalisation: options.personalisation,
          sms_sender_id: options.smsSenderId
        };

      notifyAuthNock
        .post("/v2/notifications/sms", data)
        .reply(200, { hooray: "bkbbk" });

      return notifyClient
        .sendSms(templateId, phoneNo, options)
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
          expect(response.body.hooray).to.equal("bkbbk");
        });
    });

    it("should send an sms with status callback url and bearer token", () => {
      let phoneNo = "07525755555",
        templateId = "123",
        options = {
          personalisation: { foo: "bar" },
          statusCallbackUrl: "https://localhost/callback",
          statusCallbackBearerToken: "1234567890"
        },
        data = {
          template_id: templateId,
          phone_number: phoneNo,
          personalisation: options.personalisation,
          status_callback_url: options.statusCallbackUrl,
          status_callback_bearer_token: options.statusCallbackBearerToken
        };

      notifyAuthNock
        .post("/v2/notifications/sms", data)
        .reply(200, { hooray: "bkbbk" });

      return notifyClient
        .sendSms(templateId, phoneNo, options)
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
          expect(response.body.hooray).to.equal("bkbbk");
        });
    });

    it("should reject options dicts with unknown options", () => {
      let phoneNumber = "07123456789",
        templateId = "123",
        // old personalisation dict
        options = {
          firstname: "Fred",
          surname: "Smith",
          reference: "ABC123"
        };
      return notifyClient
        .sendSms(templateId, phoneNumber, options)
        .catch(err =>
          expect(err.message).to.include('["firstname","surname"]')
        );
    });
  });

  it("should get notification by id", () => {
    let notificationId = "wfdfdgf";

    notifyAuthNock
      .get("/v2/notifications/" + notificationId)
      .reply(200, { hooray: "bkbbk" });

    return notifyClient
      .getNotificationById(notificationId)
      .then(function(response) {
        expect(response.statusCode).to.equal(200);
      });
  });

  describe("getNotifications", () => {
    it("should get all notifications", () => {
      notifyAuthNock.get("/v2/notifications").reply(200, { hooray: "bkbbk" });

      return notifyClient.getNotifications().then(function(response) {
        expect(response.statusCode).to.equal(200);
      });
    });

    it("should get all notifications with a reference", () => {
      let reference = "myref";

      notifyAuthNock
        .get("/v2/notifications?reference=" + reference)
        .reply(200, { hooray: "bkbbk" });

      return notifyClient
        .getNotifications({ reference })
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
        });
    });

    it("should get all failed notifications", () => {
      let status = "failed";

      notifyAuthNock
        .get("/v2/notifications?status=" + status)
        .reply(200, { hooray: "bkbbk" });

      return notifyClient
        .getNotifications({ status: "failed" })
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
        });
    });

    it("should get all failed sms notifications", () => {
      let templateType = "sms";
      let status = "failed";

      notifyAuthNock
        .get(
          "/v2/notifications?template_type=" +
            templateType +
            "&status=" +
            status
        )
        .reply(200, { hooray: "bkbbk" });

      return notifyClient
        .getNotifications({ templateType, status })
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
        });
    });

    it("should get all delivered sms notifications with a reference", () => {
      let templateType = "sms";
      let status = "delivered";
      let reference = "myref";

      notifyAuthNock
        .get(
          "/v2/notifications?template_type=" +
            templateType +
            "&status=" +
            status +
            "&reference=" +
            reference
        )
        .reply(200, { hooray: "bkbbk" });

      return notifyClient
        .getNotifications({ templateType, status, reference })
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
        });
    });

    it("should get all failed email notifications with a reference older than a given notification", () => {
      let templateType = "sms";
      let status = "delivered";
      let reference = "myref";
      let olderThanId = "35836a9e-5a97-4d99-8309-0c5a2c3dbc72";

      notifyAuthNock
        .get(
          "/v2/notifications?template_type=" +
            templateType +
            "&status=" +
            status +
            "&reference=" +
            reference +
            "&older_than=" +
            olderThanId
        )
        .reply(200, { hooray: "bkbbk" });

      return notifyClient
        .getNotifications({ templateType, status, reference, olderThanId })
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
        });
    });
  });

  describe("template funtions", () => {
    it("should get template by id", () => {
      let templateId = "35836a9e-5a97-4d99-8309-0c5a2c3dbc72";

      notifyAuthNock
        .get("/v2/template/" + templateId)
        .reply(200, { foo: "bar" });

      return notifyClient.getTemplateById(templateId).then(function(response) {
        expect(response.statusCode).to.equal(200);
      });
    });

    it("should get template by id and version", () => {
      let templateId = "35836a9e-5a97-4d99-8309-0c5a2c3dbc72";
      let version = 10;

      notifyAuthNock
        .get("/v2/template/" + templateId + "/version/" + version)
        .reply(200, { foo: "bar" });

      return notifyClient
        .getTemplateByIdAndVersion(templateId, version)
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
        });
    });

    it("should get all templates with unspecified template type", () => {
      notifyAuthNock.get("/v2/templates").reply(200, { foo: "bar" });

      return notifyClient.getAllTemplates().then(function(response) {
        expect(response.statusCode).to.equal(200);
      });
    });

    it("should get all templates with unspecified template type", () => {
      let templateType = "sms";

      notifyAuthNock
        .get("/v2/templates?type=" + templateType)
        .reply(200, { foo: "bar" });

      return notifyClient
        .getAllTemplates(templateType)
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
        });
    });

    it("should preview template by id with personalisation", () => {
      let templateId = "35836a9e-5a97-4d99-8309-0c5a2c3dbc72";
      let payload = { name: "Foo" };
      let expectedPersonalisation = { personalisation: payload };

      notifyAuthNock
        .post(
          "/v2/template/" + templateId + "/preview",
          expectedPersonalisation
        )
        .reply(200, { foo: "bar" });

      return notifyClient
        .previewTemplateById(templateId, payload)
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
        });
    });

    it("should preview template by id without personalisation", () => {
      let templateId = "35836a9e-5a97-4d99-8309-0c5a2c3dbc72";

      notifyAuthNock
        .post("/v2/template/" + templateId + "/preview")
        .reply(200, { foo: "bar" });

      return notifyClient
        .previewTemplateById(templateId)
        .then(function(response) {
          expect(response.statusCode).to.equal(200);
        });
    });
  });

  it("should get latest 250 received texts", function() {
    notifyAuthNock.get("/v2/received-text-messages").reply(200, { foo: "bar" });

    return notifyClient.getReceivedTexts().then(function(response) {
      expect(response.statusCode).to.equal(200);
    });
  });

  it("should get up to next 250 received texts with a reference older than a given message id", function() {
    const olderThanId = "35836a9e-5a97-4d99-8309-0c5a2c3dbc72";

    notifyAuthNock
      .get("/v2/received-text-messages?older_than=" + olderThanId)
      .reply(200, { foo: "bar" });

    return notifyClient.getReceivedTexts(olderThanId).then(function(response) {
      expect(response.statusCode).to.equal(200);
    });
  });
});

MockDate.reset();
