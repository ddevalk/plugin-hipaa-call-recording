import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';
import reducers, { namespace } from './states';

const PLUGIN_NAME = 'HipaaCallRecordingPlugin';
const SERVERLESS_FUNCTION_DOMAIN = 'twilioserverless-6686-dev.twil.io';

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
    this.registerReducers(manager);

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

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(
        `You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`
      );
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}
