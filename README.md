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

### Prerequisite Function

There is a single function located in the `functions` directory that you are expected to implement in the [Twilio Functions Runtime](https://www.twilio.com/docs/runtime), or to replicate in your own backend application.

##### Required Env Variables in your Function

The provided functions in their current state are looking for your TaskRouter Workspace Sid in the `TWILIO_WORKSPACE_SID` variable and your workflowSid in `TWILIO_WORKFLOW_SID`. Please ensure that these are set in your Twilio Function configuration.

From the repo root directory, change into functions and rename `.env.sample`.

```
cd functions && mv .env.sample .env
```

Follow the instructions on the file and set your Flex project configuration values as environment variables.

### Develop Locally

### Deploy to Twilio

twilio serverless:deploy --cwd="TwilioServerless"

### Prerequisites

### Configuration

### Deploy Function

![Function Deployment](https://github.com/twilio-professional-services/plugin-hipaa-call-recording/blob/media/deploy%20Function.png?raw=true)
