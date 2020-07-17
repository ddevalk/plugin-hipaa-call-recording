# Flex Plugin - HIPAA Compliant Call Recording

## Prerequisites

To deploy this plugin, you will need:

- An active Twilio account. [Sign up](https://www.twilio.com/try-twilio) if you don't already have one
- A Flex instance (on flex.twilio.com) where you have owner, admin, or developer permissions
- Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli) and install the [Twilio Serverless Plugin and Twilio Flex Plugin](https://www.twilio.com/docs/twilio-cli/plugins#available-plugins).

## Details

This Flex Plugin provides the following functionality:

- A simple way to securly download and store call recordings on your own server/service.
- Dual channel call recording.
- Prevents call recording URL from being exposed in Flex Insights.

### How It Works

When a Flex agent accepts a call, the Task SID and Workspace SID associated with the call Task are passed into a Twilio Function. The Twilio Function then activates dual channel call recording on the customer leg of the call. Once the recording is activated a recording SID is appended to the Task attributes and is then accessable through the TaskRouter event webhook. The recording SID can then be used to retrieve information about the recording, like a link to the recording or other meta data. The recording SID can even be used to delete the recroding off of Twilio's service if you want to store the recordings on your own service. The voice recording API can be found here: https://www.twilio.com/docs/voice/api/recording

## Setup

### Prerequisites

### Configuration

### Deploy Function

![Function Deployment](https://github.com/twilio-professional-services/plugin-hipaa-call-recording/blob/media/deploy%20Function.png?raw=true)
