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
    // Retrieve Task Attributes
    const task = await client.taskrouter
      .workspaces(event.workspaceSid)
      .tasks(event.taskSid)
      .fetch();

    // Convert Task Attributes to JSON
    const taskAttributes = JSON.parse(task.attributes);

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
        recordingChannels: 'dual',
      });
      if (!recording.sid) throw new Error('No recording SID.');

      // Add recording SID to Task Attributes
      let updatedTaskAttributes = {
        ...taskAttributes,
        recordingSid: recording.sid,
      };

      // Update Task Attributes
      const taskUpdated = await client.taskrouter
        .workspaces(event.workspaceSid)
        .tasks(event.taskSid)
        .update({
          attributes: JSON.stringify(updatedTaskAttributes),
        });

      // Confirm Task was updated with Recording SID
      updatedTaskAttributes = JSON.parse(taskUpdated.attributes);
      const recordingSid = updatedTaskAttributes.recordingSid;
      if (!recordingSid)
        throw new Error('Task was NOT updated with recording SID.');

      callback(null, response);
    }
  } catch (err) {
    console.error('Error recording call', err);
    response.setStatusCode(500);
    callback(null, response);
  }
});
