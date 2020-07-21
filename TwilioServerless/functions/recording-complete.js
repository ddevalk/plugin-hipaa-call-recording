exports.handler = async (context, event, callback) => {
  // Add the NodeJS Helper Library by calling context.getTwilioClient()
  const client = context.getTwilioClient();
  const response = new Twilio.Response();

  try {
    // Retrieve Task Attributes
    const task = await client.taskrouter
      .workspaces(context.WORKSPACE_SID)
      .tasks(event.taskSid)
      .fetch();

    // Convert Task Attributes to JSON
    const taskAttributes = JSON.parse(task.attributes);

    // Error out if no recording SID.
    if (!event.RecordingSid) throw new Error('No recording SID.');

    // Add recording SID to Task Attributes
    let updatedTaskAttributes = {
      ...taskAttributes,
      recordingSid: event.RecordingSid,
    };

    // Update Task Attributes
    const taskUpdated = await client.taskrouter
      .workspaces(context.WORKSPACE_SID)
      .tasks(event.taskSid)
      .update({
        attributes: JSON.stringify(updatedTaskAttributes),
      });

    // Confirm Task was updated with Recording SID
    updatedTaskAttributes = JSON.parse(taskUpdated.attributes);
    const recordingSid = updatedTaskAttributes.recordingSid;
    if (!recordingSid)
      throw new Error('Task was NOT updated with recording SID.');

    response.setStatusCode(200);
    callback(null, response);
  } catch (err) {
    response.setStatusCode(500);
    console.error('Error recording call', err);
    callback(null, response);
  }
};
