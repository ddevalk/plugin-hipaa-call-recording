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
    // Send Task SID to Function after the Task is accepted by worker.
    flex.Actions.addListener('afterAcceptTask', async payload => {
      const waitTimeMs = 500;
      const maxWaitTimeMs = 15000;
      const waitForConferenceInterval = setInterval(async () => {
        const { task } = payload;
        const { conference } = task;
        if (conference === undefined || conference.participants.length <= 1) {
          return;
        }
        clearInterval(waitForConferenceInterval);
        // Execute your conference logic here
        const url = `${runtimeDomain}/recording-service`;

        conference.participants.forEach(participant => {
          if (participant.source.participant_type == 'customer') {
            const body = {
              callSid: participant.callSid,
              taskSid: conference.sid,
              Token: manager.store.getState().flex.session.ssoTokenPayload
                .token,
            };

            const options = {
              method: 'POST',
              body: new URLSearchParams(body),
              headers: {
                'Content-Type':
                  'application/x-www-form-urlencoded;charset=UTF-8',
              },
            };
            try {
              fetch(url, options);
            } catch (err) {
              console.error('Error connecting to function: ', err);
            }
          }
        });
      }, waitTimeMs);
      setTimeout(() => {
        clearInterval(waitForConferenceInterval);
      }, maxWaitTimeMs);
    });
  }
}
