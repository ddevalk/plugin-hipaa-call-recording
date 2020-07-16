import React from 'react';
import { FlexPlugin } from 'flex-plugin';

const PLUGIN_NAME = 'HipaaCallRecordingPlugin';
const SERVERLESS_FUNCTION_DOMAIN = 'default-4549-dev.twil.io';

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
    flex.Actions.addListener('afterAcceptTask', payload => {
      const waitTimeMs = 100;
      const maxWaitTimeMs = 5000;

      /**
       * Setting an interval function because the conference setup
       * happens a few miliseconds after 'afterAcceptTask'
       */
      const waitForConferenceInterval = setInterval(() => {
        const { task } = payload;
        const { conference } = task;
        if (conference === undefined || conference.participants.length < 2) {
          return;
        }
        clearInterval(waitForConferenceInterval);
        // Execute your conference logic here
        console.debug('*** Conference established:', conference);
        console.debug('***** Task Details: ', task);

        /**
         * Iterate over array of participants to retrieve
         * the correct participant call SID and pass it to
         * a Twilio Function using Fetch.
         */
        conference.participants.map(participant => {
          if (participant.isMyself === true) {
            const body = {
              Token: manager.store.getState().flex.session.ssoTokenPayload
                .token,
              callSid: participant.callSid,
              workspaceSid: task.sourceObject.workspaceSid,
              taskSid: task.taskSid,
            };

            const options = {
              method: 'POST',
              body: new URLSearchParams(body),
              headers: {
                'Content-Type':
                  'application/x-www-form-urlencoded;charset=UTF-8',
              },
            };

            return fetch(
              `https://${SERVERLESS_FUNCTION_DOMAIN}/recording-service`,
              options
            );
          }
          return false;
        });
      }, waitTimeMs);
      setTimeout(() => {
        clearInterval(waitForConferenceInterval);
      }, maxWaitTimeMs);
    });
  }
}
