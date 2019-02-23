const express = require('express')
const router = express.Router()

const {
  createHash,
  formatSubscriptions,
} = require('./util')

const listSubscriptionsToken = process.env.MM_LIST_SUBSCRIPTIONS_TOKEN
router.post('/list-subscriptions', async (req, res) => {
  if (req.body.token != listSubscriptionsToken) {
    res.writeHead(404)
    res.end()
    return
  }

  const sns = req.services.sns
  const args = req.body.text.split(' ')

  let subscriptions
  if (args[0]) {
    subscriptions = await sns.listSubscriptionsByTopic(args[0])
  }
  else {
    subscriptions = await sns.listSubscriptions()
  }

  const message = formatSubscriptions(subscriptions)

  try {
    const msg = {
      text: message,
    }
    res.json({
      ...msg,
    })
  }
  catch (err) {
    console.log(err)
    res.writeHead(500)
    res.end(err.toString())
  }
})

const listTopicsToken = process.env.MM_LIST_TOPICS_TOKEN
router.post('/list-topics', async (req, res) => {
  if (req.body.token != listTopicsToken) {
    res.writeHead(404)
    res.end()
    return
  }

  const sns = req.services.sns
  const topics = await sns.listTopicNames()

  try {
    const msg = {
      text: ['Topics:', ...topics].join('\n'),
    }
    res.json({
      ...msg,
    })
  }
  catch (err) {
    console.log(err)
    res.writeHead(500)
    res.end(err.toString())
  }
})

const createSubscriptionToken = process.env.MM_CREATE_SUBSCRIPTION_TOKEN
router.post('/create-subscription', async (req, res) => {
  if (req.body.token != createSubscriptionToken) {
    res.writeHead(404)
    res.end()
    return
  }

  const {
    sns,
  } = req.services
  const args = req.body.text.split(' ')

  console.log(req.body.text)

  let channelName = args[0]
  if (channelName[0] === '~') {
    channelName = channelName.substring(1)
  }
  console.log(`Channel name: ${channelName}`)

  let topicName = args[1]
  console.log(`Topic Name: ${topicName}`)

  if (!topicName.includes(':')) {
    topicArn = await sns.getArnForName(topicName)
  }
  console.log(`Topic Arn: ${topicArn}`)

  const hash = `mm-integration-${channelName}-${createHash()}`

  const host = process.env.WEBHOOK_HOST
  const endpoint = `${host}/sns/${hash}`

  try {
    await sns.createSubscription(topicArn, endpoint)

    const topicName = topicArn.substring(topicArn.lastIndexOf(':') + 1)

    const msg = {
      text: `New subscription created for \`${topicName}\` to post to \`${channelName}\` channel.`,
    }
    res.json({
      ...msg,
    })
  }
  catch (err) {
    console.log(err.stack)
    res.writeHead(500)
    res.end(err.toString())
  }
})

module.exports = router
