const TokenValidator = require('twilio-flex-token-validator').functionValidator;

exports.handler = TokenValidator(async function (context, event, callback) {
  // Add the NodeJS Helper Library by calling context.getTwilioClient()
  const client = context.getTwilioClient();

  // Create a custom Twilio Response
  // Set the CORS headers to allow Flex to make an HTTP request to the Twilio Function
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setStatusCode(200);

  // Check to see if this call is already being recorded
  const isRecording = await client.recordings
    .list({ callSid: event.callSid, limit: 20 })
    .then(recordings => recordings.forEach(r => console.log(r.sid)));

  if (isRecording === null) {
    // Record caller/called line
    const recording = await client.calls(event.callSid).recordings.create({
      recordingChannels: 'dual',
    });

    // Retrieve Task Attributes
    const task = await client.taskrouter
      .workspaces(event.workspaceSid)
      .tasks(event.taskSid)
      .fetch();

    // Parse Task Attributes and update JSON object with recording SID
    const taskAttributes = JSON.parse(task.attributes);
    const updatedTaskAttributes = {
      ...taskAttributes,
      recordingSid: recording.sid,
    };

    // Update Task Attributes
    await client.taskrouter
      .workspaces(event.workspaceSid)
      .tasks(event.taskSid)
      .update({
        attributes: JSON.stringify(updatedTaskAttributes),
      });
  }

  callback(null, response);
});
