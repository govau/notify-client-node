# Contributing

Pull requests welcome.

## Working on the client locally

`npm install --save @govau-platforms/notify-client`

## Tests

There are unit and integration tests that can be run to test functionality of the client.

To run the unit tests:

`make test`

## Integration Tests

Before running the integration tests, please ensure that the environment variables are set up.

```
export NOTIFY_API_URL="https://example.notify-api.url"
export API_KEY="example_API_test_key"
export FUNCTIONAL_TEST_NUMBER="valid mobile number"
export FUNCTIONAL_TEST_EMAIL="valid email address"
export EMAIL_TEMPLATE_ID="valid email_template_id"
export SMS_TEMPLATE_ID="valid sms_template_id"
export EMAIL_REPLY_TO_ID="valid email reply to id"
export SMS_SENDER_ID="valid sms_sender_id - to test sending to a receiving number, so needs to be a valid number"
export STATUS_CALLBACK_URL="valid HTTPS URL of the server - to which delivery status updates to be sent to"
export STATUS_CALLBACK_BEARER_TOKEN="valid status_callback_bearer_token - to authenticate requests sent to STATUS_CALLBACK_URL server"
export API_SENDING_KEY="API_whitelist_key for sending a SMS to a receiving number"
export INBOUND_SMS_QUERY_KEY="API_test_key to get received text messages - leave blank for local development as cannot test locally"
```

To run the integration tests:

`make integration-test`

The integration tests are used to test the contract of the response to all the api calls, ensuring the latest version of notify-api do not break the contract of the notify-client.
