const TokenValidator = require('twilio-flex-token-validator').functionValidator;

exports.handler = TokenValidator(async function (context, event, callback) {
  // Add the NodeJS Helper Library by calling context.getTwilioClient()
  const client = context.getTwilioClient();

  // Create a custom Twilio Response
  // Set the CORS headers to allow Flex to make an HTTP request to the Twilio Function
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-type', 'application/json');

  try {
    // Throw error if no call SID
    if (!event.callSid) throw new Error('Unable to retrieve call SID.');

    // Check to see if this call is already being recorded
    const isRecording = await client.recordings.list({
      callSid: event.callSid,
      limit: 20,
    });

    if (isRecording.length === 0) {
      // Record caller/called line
      const recording = await client.calls(event.callSid).recordings.create({
        recordingStatusCallback: `https://${context.DOMAIN_NAME}/recording-complete?taskSid=${event.taskSid}`,
        recordingStatusCallbackEvent: ['completed'],
        recordingChannels: 'dual',
      });

      response.setStatusCode(200);
      callback(null, response);
    }
  } catch (err) {
    console.error('Error recording call', err);
    response.setStatusCode(500);
    callback(null, response);
  }
});
