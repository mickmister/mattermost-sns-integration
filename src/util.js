const crypto = require('crypto')

const createHash = () => {
  return crypto.randomBytes(20).toString('hex')
}

const decodeBody = (req) => {
  return new Promise(async (resolve, reject) => {
    const chunks = [];
    req.on('data', function (chunk) {
      chunks.push(chunk)
    })
    req.on('end', function () {
      try {
        resolve(JSON.parse(chunks.join('')))
      }
      catch (e) {
        reject(e)
      }
    })
  })
}

const formatSubscriptions = (subscriptions) => {
  return subscriptions.map(subscription => {
    const {
      Endpoint: endpoint,
      TopicArn: topicArn,
      Protocol: protocol,
    } = subscription
    let message
    switch (protocol) {
      case 'http':
      case 'https': {
        if (endpoint.includes('mm-integration')) {
          const channelName = endpoint.substring(
            endpoint.indexOf('mm-integration') + 15,
            endpoint.lastIndexOf('-'),
          )
          message = `Channel subscription - \`${topicNameFromArn(topicArn)}\` posts to \`${channelName}\``
        }
        else {
          message = `Webhook - \`${topicNameFromArn(topicArn)}\` ${endpoint}`
        }
        break
      }
      case 'email': {
        const numAdresses = endpoint.split(' ').length
        message = `Email list - ${numAdresses} email addresses. Topic: \`${topicNameFromArn(topicArn)}\``
        break
      }
      default: {
        message = `${protocol} ${endpoint}`
        break
      }
    }
    return message
  }).join('\n')
}

const topicNameFromArn = arn => {
  return arn.substring(arn.lastIndexOf(':') + 1)
}


module.exports = {
  createHash,
  decodeBody,
  formatSubscriptions,
}
