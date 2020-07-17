import React from 'react';
import { FlexPlugin } from 'flex-plugin';
import Axios from 'axios';

const PLUGIN_NAME = 'HipaaCallRecordingPlugin';
const SERVERLESS_FUNCTION_DOMAIN = 'twilioserverless-6038-dev.twil.io';

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
    flex.Actions.addListener('afterAcceptTask', async payload => {
      console.debug('****START RECORDING');
      const { task } = payload;
      const newToken = manager.store.getState().flex.session.ssoTokenPayload
        .token;
      const url = 'https://local-node.ngrok.io/recording-service';
      console.debug('*** TASK INFO: ', task);
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

      const response = await fetch(url, options);

      console.debug('***TOKEN: ', newToken);

      console.debug('***API Response', response);
    });
  }
}
