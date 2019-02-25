require('dotenv').config()
const AWS = require('aws-sdk')

module.exports = class SNSClient {
  constructor(options) {
    this.options = options

    this.sns = new AWS.SNS(this.options)
  }

  async getTopics() {
    const topicArns = await this.listTopicArns()

    return Promise.all(topicArns.map(arn => this.getTopic(arn)))
  }

  async listTopicArns() {
    const data = await this.sns.listTopics().promise()
    return data.Topics.map(topic => topic.TopicArn)
  }

  async listTopicNames() {
    const arns = await this.listTopicArns()
    return arns.map(arn => arn.substring(arn.lastIndexOf(':') + 1))
  }

  async getArnForName(name) {
    const arns = await this.listTopicArns()
    return arns.find(arn => arn.substring(arn.lastIndexOf(':') + 1) === name)
  }

  async getTopic(arn) {
    const data = await this.sns.getTopicAttributes({TopicArn: arn}).promise()
    return data.Attributes
  }

  async createTopic(name, attributes={}) {
    const params = {
      Name: name,
      Attributes: attributes,
    }

    return this.sns.createTopic(params).promise()
  }

  async listSubscriptions(params={}) {
   const data = await this.sns.listSubscriptions(params).promise()
   return data.Subscriptions
  }

  async listSubscriptionsByTopic(topicArn) {
    if (!topicArn.includes(':')) {
      console.log(`Topic Name: ${topicArn}`)
      topicArn = await this.getArnForName(topicArn)
    }

    console.log(`Topic Arn: ${topicArn}`)

    const data = await this.sns.listSubscriptionsByTopic({
      TopicArn: topicArn,
    }).promise()
    return data.Subscriptions
  }

  async createSubscription(topicArn, endpoint, attributes={}) {
    if (!topicArn.includes(':')) {
      console.log(`Topic Name: ${topicArn}`)
      topicArn = await sns.getArnForName(topicArn)
    }

    console.log(`Topic Arn: ${topicArn}`)
    const params = {
      Protocol: 'https',
      TopicArn: topicArn,
      Attributes: attributes,
      Endpoint: endpoint,
      ReturnSubscriptionArn: true,
    }

    return this.sns.subscribe(params).promise()
  }
}
