# Flex Plugin - HIPAA Compliant Call Recording

## Prerequisites

To deploy this plugin, you will need:

- An active Twilio account. [Sign up](https://www.twilio.com/try-twilio) if you don't already have one
- A Flex instance (on flex.twilio.com) where you have owner, admin, or developer permissions
- Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli) and install the [Twilio Serverless Plugin and Twilio Flex Plugin](https://www.twilio.com/docs/twilio-cli/plugins#available-plugins).
- Make sure you have Node 10.19 and npm installed. We suggest using [nvm](https://github.com/nvm-sh/nvm) to install Node and npm to control the version of Node you are using for development.

## Details

This Flex Plugin provides the following functionality:

- A simple way to securly download and store call recordings on your own server/service.
- Dual channel call recording.
- Prevents call recording URL from being exposed in Flex Insights.

### How It Works

When a Flex agent accepts a call, the Task SID and Workspace SID associated with the call Task are passed into a Twilio Function. The Twilio Function then activates dual channel call recording on the customer leg of the call. Once the recording is activated a recording SID is appended to the Task attributes and is then accessible through the TaskRouter event webhook. The recording SID can then be used to retrieve information about the recording, like a link to the recording or other metadata. The recording SID can even be used to delete the recording off of Twilio's service if you want to store the recordings on your own service. The voice recording API can be found here: https://www.twilio.com/docs/voice/api/recording

## Setup

#### Important note about using the Twilio CLI

When using the Twilio CLI, make sure you are working from the correct profile for your project. You can see a list of your Twilio profiles by running `twilio profiles:list` from the terminal/commandline. If you have multiple profiles you can select the necessary one for working on your project by running `twilio profiles:use name-of-profile`

#### Turn Flex recording OFF!

![Recording Off](https://github.com/twilio-professional-services/plugin-hipaa-call-recording/blob/media/recordingOff.gif?raw=true)

### Prerequisite Function

There is a single function located in the `TwilioServerless/functions` directory that you are expected to implement in the [Twilio Functions Runtime](https://www.twilio.com/docs/runtime), or to replicate in your own backend application.

#### Required Env Variables in your Function

The provided Function in it's current state is looking for the `ACCOUNT_SID` and your `AUTH_TOKEN` variables. Please ensure that these are set in your Twilio Function configuration.

From the repo root directory, change into functions and rename `.env.sample`.

```
cd functions && mv .env.sample .env
```

Follow the instructions on the file and set your Flex project configuration values as environment variables.

### Develop Locally

This Flex Plugin and Function can be run locally for testing and additional development. From your terminal make sure you are in the root directory of the plugin and then follow these steps:

1. Install all dependencies for this project:

   ```
   npm install
   ```

   When the above command finishes, run the following command.

   ```
   npm install TwilioServerless
   ```

2. Start the Flex Plugin by running the following command. This will open a new browser tab running Flex:

   ```
   npm start
   ```

3. Start the Twilio Function by running the following command:

   ```
   twilio serverless:start --cwd="TwilioServerless"
   ```

You now have a local development running. You will be able to interact with your local instance of Flex by navigating your browser to https://localhost:3000.

### Deploy to Twilio

1. First you should deploy your Function to Twilio. Run the following command from the root of the plugin:

   ```
   twilio serverless:deploy --cwd="TwilioServerless"
   ```

   The result will look something like this:

   ![Function Deployment](https://github.com/twilio-professional-services/plugin-hipaa-call-recording/blob/media/deploy%20Function.png?raw=true)

   Note in the image above the **Domain** name. Copy that domain name and open the `config.js` file in your code in the `/src` directory. If you haven't changed them, the contents of the `config.js` file should look like this:

   ```
   export default {
     runtimeDomain: 'http://localhost:3000',
   };
   ```

2. Change the `config.js` file to use the Domain you just copied from deploying your Function. In the example we are using in this documentation, the `config.js` file would be changed to the following:

   ```
   export default {
     runtimeDomain: 'http://twilioserverless-6038-dev.twil.io',
   };
   ```

3. Once you've made this change in the `config.js` file we can now deploy the Plugin code up to Twilio. Run the following command to deploy your Plugin to Twilio:

   ```
   npm run deploy
   ```

Your code should now be deployed to Twilio and can be accessed at [flex.twilio.com](https://flex.twilio.com)
