require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const snsRoutes = require('./sns/incoming-message')
const slashCommandRoutes = require('./slash-commands')

const MattermostClient = require('./mattermost')
const SNSClient = require('./sns/client')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const mattermost = new MattermostClient(process.env)
process.nextTick(() => {
  mattermost.login()
})

const mattermostClientMiddleware = (req, res, next) => {
  req.services = {
    ...req.services,
    mattermost,
  }
  next()
}
app.use(mattermostClientMiddleware)

const snsEnvVars = {
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  region: process.env.REGION,
}
const sns = new SNSClient(snsEnvVars)
const snsMiddleware = (req, res, next) => {
  req.services = {
    ...req.services,
    sns,
  }
  next()
}
app.use(snsMiddleware)

app.use('/sns', snsRoutes)
app.use('/commands', slashCommandRoutes)

const port = process.env.PORT
app.listen(port, () => console.log(`Listening on port ${port}`))
