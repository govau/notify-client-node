import NotifyClient from "../../src/client";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import chaiJsonSchema from "chai-json-schema";
chai.use(chaiAsPromised);
chai.use(chaiJsonSchema);

const should = chai.should();
const expect = chai.expect;

// will not run unless flag provided `npm test --integration`
const describer = process.env.npm_config_integration
  ? describe.only
  : describe.skip;

describer("notification api with a live service", function() {
  // default is 2000 (ms) - api is sometimes slower than this :(
  this.timeout(10000);

  let notifyClient;
  let whitelistNotifyClient;
  let receivedTextClient;
  let emailNotificationId;
  let smsNotificationId;
  const personalisation = { name: "Foo" };
  const clientRef = "client-ref";
  const statusCallbackUrl = "https://localhost/callback";
  const statusCallbackBearerToken = "1234567890";
  const email = process.env.FUNCTIONAL_TEST_EMAIL;
  const phoneNumber = process.env.FUNCTIONAL_TEST_NUMBER;
  const smsTemplateId = process.env.SMS_TEMPLATE_ID;
  const smsSenderId = process.env.SMS_SENDER_ID || undefined;
  const emailTemplateId = process.env.EMAIL_TEMPLATE_ID;
  const emailReplyToId = process.env.EMAIL_REPLY_TO_ID || undefined;

  beforeEach(() => {
    const baseUrl = process.env.NOTIFY_API_URL;
    const apiKeyId = process.env.API_KEY;
    const inboundSmsKeyId = process.env.INBOUND_SMS_QUERY_KEY;
    const whitelistApiKeyId = process.env.API_SENDING_KEY;
    notifyClient = new NotifyClient({ baseUrl, apiKeyId });
    whitelistNotifyClient = new NotifyClient({
      baseUrl,
      apiKeyId: whitelistApiKeyId
    });
    receivedTextClient = new NotifyClient({
      baseUrl,
      apiKeyId: inboundSmsKeyId
    });
    var definitions_json = require("./schemas/v2/definitions.json");
    chai.tv4.addSchema("definitions.json", definitions_json);
  });

  describe("notifications", () => {
    it("send email notification", () => {
      const postEmailNotificationResponseJson = require("./schemas/v2/POST_notification_email_response.json");
      const options = {
        personalisation: personalisation,
        reference: clientRef
      };

      return notifyClient
        .sendEmail(emailTemplateId, email, options)
        .then(response => {
          response.statusCode.should.equal(201);
          expect(response.body).to.be.jsonSchema(
            postEmailNotificationResponseJson
          );
          response.body.content.body.should.equal(
            "Hello Foo\n\nFunctional test help make our world a better place\n"
          );
          response.body.content.subject.should.equal("NodeJS integration test");
          response.body.reference.should.equal(clientRef);
          emailNotificationId = response.body.id;
        });
    });

    it("send email notification with email_reply_to_id", () => {
      const postEmailNotificationResponseJson = require("./schemas/v2/POST_notification_email_response.json");
      const options = {
        personalisation: personalisation,
        reference: clientRef,
        emailReplyToId: emailReplyToId
      };

      should.exist(emailReplyToId);
      return notifyClient
        .sendEmail(emailTemplateId, email, options)
        .then(response => {
          response.statusCode.should.equal(201);
          expect(response.body).to.be.jsonSchema(
            postEmailNotificationResponseJson
          );
          response.body.content.body.should.equal(
            "Hello Foo\n\nFunctional test help make our world a better place\n"
          );
          response.body.content.subject.should.equal("NodeJS integration test");
          response.body.reference.should.equal(clientRef);
          emailNotificationId = response.body.id;
        });
    });

    it("send email notification with status callback URL and bearer token", () => {
      const postEmailNotificationResponseJson = require("./schemas/v2/POST_notification_email_response.json");
      const options = {
        personalisation: personalisation,
        reference: clientRef,
        statusCallbackUrl: statusCallbackUrl,
        statusCallbackBearerToken: statusCallbackBearerToken
      };

      return notifyClient
        .sendEmail(emailTemplateId, email, options)
        .then(response => {
          response.statusCode.should.equal(201);
          expect(response.body).to.be.jsonSchema(
            postEmailNotificationResponseJson
          );
          response.body.content.body.should.equal(
            "Hello Foo\n\nFunctional test help make our world a better place\n"
          );
          response.body.content.subject.should.equal("NodeJS integration test");
          response.body.reference.should.equal(clientRef);
          emailNotificationId = response.body.id;
        });
    });

    it("send sms notification", () => {
      var postSmsNotificationResponseJson = require("./schemas/v2/POST_notification_sms_response.json"),
        options = {
          personalisation: personalisation,
          statusCallbackUrl: statusCallbackUrl,
          statusCallbackBearerToken: statusCallbackBearerToken
        };

      return notifyClient
        .sendSms(smsTemplateId, phoneNumber, options)
        .then(response => {
          response.statusCode.should.equal(201);
          expect(response.body).to.be.jsonSchema(
            postSmsNotificationResponseJson
          );
          response.body.content.body.should.equal(
            "Hello Foo\n\nFunctional Tests make our world a better place"
          );
          smsNotificationId = response.body.id;
        });
    });

    it("send sms notification with sms_sender_id", () => {
      var postSmsNotificationResponseJson = require("./schemas/v2/POST_notification_sms_response.json"),
        options = {
          personalisation: personalisation,
          reference: clientRef,
          smsSenderId: smsSenderId
        };

      should.exist(smsSenderId);
      return whitelistNotifyClient
        .sendSms(smsTemplateId, phoneNumber, options)
        .then(response => {
          response.statusCode.should.equal(201);
          expect(response.body).to.be.jsonSchema(
            postSmsNotificationResponseJson
          );
          response.body.content.body.should.equal(
            "Hello Foo\n\nFunctional Tests make our world a better place"
          );
          smsNotificationId = response.body.id;
        });
    });

    it("send sms notification with status callback URL and bearer token", () => {
      var postSmsNotificationResponseJson = require("./schemas/v2/POST_notification_sms_response.json"),
        options = { personalisation: personalisation };

      return notifyClient
        .sendSms(smsTemplateId, phoneNumber, options)
        .then(response => {
          response.statusCode.should.equal(201);
          expect(response.body).to.be.jsonSchema(
            postSmsNotificationResponseJson
          );
          response.body.content.body.should.equal(
            "Hello Foo\n\nFunctional Tests make our world a better place"
          );
          smsNotificationId = response.body.id;
        });
    });

    const getNotificationJson = require("./schemas/v2/GET_notification_response.json");
    const getNotificationsJson = require("./schemas/v2/GET_notifications_response.json");

    it("get email notification by id", () => {
      should.exist(emailNotificationId);
      return notifyClient
        .getNotificationById(emailNotificationId)
        .then(response => {
          response.statusCode.should.equal(200);
          expect(response.body).to.be.jsonSchema(getNotificationJson);
          response.body.type.should.equal("email");
          response.body.body.should.equal(
            "Hello Foo\n\nFunctional test help make our world a better place\n"
          );
          response.body.subject.should.equal("NodeJS integration test");
        });
    });

    it("get sms notification by id", () => {
      should.exist(smsNotificationId);
      return notifyClient
        .getNotificationById(smsNotificationId)
        .then(response => {
          response.statusCode.should.equal(200);
          expect(response.body).to.be.jsonSchema(getNotificationJson);
          response.body.type.should.equal("sms");
          response.body.body.should.equal(
            "Hello Foo\n\nFunctional Tests make our world a better place"
          );
        });
    });

    it("get all notifications", () => {
      chai.tv4.addSchema("notification.json", getNotificationJson);
      return notifyClient.getNotifications().then(response => {
        response.should.have.property("statusCode", 200);
        expect(response.body).to.be.jsonSchema(getNotificationsJson);
      });
    });
  });

  describe("templates", () => {
    const getTemplateJson = require("./schemas/v2/GET_template_by_id.json");
    const getTemplatesJson = require("./schemas/v2/GET_templates_response.json");
    const postTemplatePreviewJson = require("./schemas/v2/POST_template_preview.json");
    const getReceivedTextJson = require("./schemas/v2/GET_received_text_response.json");
    const getReceivedTextsJson = require("./schemas/v2/GET_received_texts_response.json");

    it("get sms template by id", () => {
      return notifyClient.getTemplateById(smsTemplateId).then(response => {
        response.statusCode.should.equal(200);
        expect(response.body).to.be.jsonSchema(getTemplateJson);
        response.body.name.should.equal("node-sdk-test-sms");
        should.not.exist(response.body.subject);
      });
    });

    it("get email template by id", () => {
      return notifyClient.getTemplateById(emailTemplateId).then(response => {
        response.statusCode.should.equal(200);
        expect(response.body).to.be.jsonSchema(getTemplateJson);
        response.body.body.should.equal(
          "Hello ((name))\r\n\r\nFunctional test help make our world a better place"
        );
        response.body.name.should.equal("node-sdk-test-email");
        response.body.subject.should.equal("NodeJS integration test");
      });
    });

    it("get sms template by id and version", () => {
      return notifyClient
        .getTemplateByIdAndVersion(smsTemplateId, 1)
        .then(response => {
          response.statusCode.should.equal(200);
          expect(response.body).to.be.jsonSchema(getTemplateJson);
          response.body.name.should.equal("node-sdk-test-sms");
          should.not.exist(response.body.subject);
          response.body.version.should.equal(1);
        });
    });

    it("get email template by id and version", () => {
      return notifyClient
        .getTemplateByIdAndVersion(emailTemplateId, 1)
        .then(response => {
          response.statusCode.should.equal(200);
          expect(response.body).to.be.jsonSchema(getTemplateJson);
          response.body.name.should.equal("node-sdk-test-email");
          response.body.version.should.equal(1);
        });
    });

    it("get all templates", () => {
      return notifyClient.getAllTemplates().then(response => {
        response.statusCode.should.equal(200);
        expect(response.body).to.be.jsonSchema(getTemplatesJson);
      });
    });

    it("get sms templates", () => {
      return notifyClient.getAllTemplates("sms").then(response => {
        response.statusCode.should.equal(200);
        expect(response.body).to.be.jsonSchema(getTemplatesJson);
      });
    });

    it("get email templates", () => {
      return notifyClient.getAllTemplates("email").then(response => {
        response.statusCode.should.equal(200);
        expect(response.body).to.be.jsonSchema(getTemplatesJson);
      });
    });

    it("preview sms template", () => {
      var personalisation = { name: "Foo" };
      return notifyClient
        .previewTemplateById(smsTemplateId, personalisation)
        .then(response => {
          response.statusCode.should.equal(200);
          expect(response.body).to.be.jsonSchema(postTemplatePreviewJson);
          response.body.type.should.equal("sms");
          should.not.exist(response.body.subject);
        });
    });

    it("preview email template", () => {
      var personalisation = { name: "Foo" };
      return notifyClient
        .previewTemplateById(emailTemplateId, personalisation)
        .then(response => {
          response.statusCode.should.equal(200);
          expect(response.body).to.be.jsonSchema(postTemplatePreviewJson);
          response.body.type.should.equal("email");
          should.exist(response.body.subject);
        });
    });

    // Inbound sms functionality not fully tested/supported
    it.skip("get all received texts", () => {
      chai.tv4.addSchema("receivedText.json", getReceivedTextJson);
      return receivedTextClient.getReceivedTexts().then(response => {
        response.statusCode.should.equal(200);
        expect(response.body).to.be.jsonSchema(getReceivedTextsJson);
        expect(response.body["received_text_messages"]).to.be.an("array").that
          .is.not.empty;
      });
    });
  });
});
