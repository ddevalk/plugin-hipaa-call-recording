import React from 'react';
import { FlexPlugin } from 'flex-plugin';
import PluginConfig from './config';

const PLUGIN_NAME = 'HipaaCallRecordingPlugin';
const { runtimeDomain } = PluginConfig;

export default class HipaaCallRecordingPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    // Send Task SID to Function after the Task is accepted.
    flex.Actions.addListener('afterAcceptTask', async payload => {
      const { task } = payload;
      const url = `https://${runtimeDomain}/recording-service`;
      const body = {
        workspaceSid: task.sourceObject.workspaceSid,
        taskSid: task.taskSid,
        Token: manager.store.getState().flex.session.ssoTokenPayload.token,
      };

      const options = {
        method: 'POST',
        body: new URLSearchParams(body),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
      };

      // Throw Error if Function doesn't respond with 200 OK.
      const response = await fetch(url, options);
      if (response.status != 200) {
        console.error(
          'ERROR - Unable to connect to recording Function',
          `Status Code: ${response.status}`
        );
      }
    });
  }
}
