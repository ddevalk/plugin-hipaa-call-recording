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

  console.log('anything');

  // Retrieve Task Attributes
  const task = await client.taskrouter
    .workspaces(event.workspaceSid)
    .tasks(event.taskSid)
    .fetch();
  const taskAttributes = JSON.parse(task.attributes);
  const callSid = taskAttributes.conference.participants.customer;

  // Check to see if this call is already being recorded
  const isRecording = await client.recordings.list({
    callSid: callSid,
    limit: 20,
  });

  console.log(isRecording);

  // const recording = await client.calls(callSid).recordings.create({
  //   recordingChannels: 'dual',
  // });

  // const updatedTaskAttributes = {
  //   ...taskAttributes,
  //   recordingSid: recording.sid,
  // };

  // await client.taskrouter
  //   .workspaces(event.workspaceSid)
  //   .tasks(event.taskSid)
  //   .update({
  //     attributes: JSON.stringify(updatedTaskAttributes),
  //   });

  if (isRecording.length === 0) {
    console.debug('*** NO RECORDING DETECTED');
    console.debug('*** START RECORDING');

    // Record caller/called line
    const recording = await client.calls(callSid).recordings.create({
      recordingChannels: 'dual',
    });

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
