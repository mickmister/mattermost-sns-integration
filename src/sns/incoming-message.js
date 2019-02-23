const express = require('express')
const router = express.Router()
const request = require('request-promise')

const {
  decodeBody,
} = require('../util')

router.post('/:id', async (req, res) => {
  const id = req.params.id

  const body = await decodeBody(req)

  const{mattermost} = req.services

  if (body && body.SubscribeURL) {
    console.log('Confirming subscription')
    await request.get(body.SubscribeURL)
    console.log('Subscription confirmed')
    return res.end()
  }

  const message = getMessage(body)
  console.log(`Recieved SNS Message: ${message}`)

  const channelName = id.substring(
    id.indexOf('mm-integration') + 15,
    id.lastIndexOf('-'),
  )
  const channelId = await mattermost.getChannelId(channelName)

  try {
    await mattermost.createPost({
      message,
      channel_id: channelId,
    })
  }
  catch (err) {
    res.writeHead(500)
    res.end(err.toString())
  }
})

const getMessage = (res) => {
  return res.Subject || res.Message
}

module.exports = router
