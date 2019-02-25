# mattermost-sns-integration

A webhook-based integration to connect AWS SNS (Simple Notification Service) to a Mattermost instance. Three commands are supported to communicate with SNS.

---

`/list-topics`

Gets topics from SNS and lists the names of the available topics in the configured region.

---

`/list-subscriptions (topic-name | topic-arn)`

List the subscriptions for a given topic. Formats the results in the following ways:
- for a subscription created by this integration, the output will show which channel the subscription is for
- for a different kind webhook, it will display the endpoint
- for an email list, it will display the number of email addresses on the email list

---

`/create-subscription (channel-name) (topic-name | topic-arn)`

Creates a new subscription on the specified topic to post to the specified channel when a new message is published to the topic. The `Subject` field of the message takes precedence over the `Message` field.
