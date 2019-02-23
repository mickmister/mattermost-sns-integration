const request = require('request-promise')

const defaultOptions = {
  host: process.env.MM_HOST,
  credentials: {
    username: process.env.MM_USERNAME,
    password: process.env.MM_PASSWORD,
  },
  teamId: process.env.MM_TEAM_ID,
}

module.exports = class MattermostClient {

  constructor(options) {
    this.options = {
      ...defaultOptions,
      ...options,
    }

    this.token = null
  }

  makeUri(path) {
    const {host} = this.options
    return `${host}/api/v4/${path}`
  }

  async getChannelId (channelName) {
    const {teamId} = this.options

    if (channelName[0] === '~') {
      channelName = channelName.substring(1)
    }

    const uri = this.makeUri(`teams/${teamId}/channels/name/${channelName}`)
    const data = await request({
      method: 'GET',
      uri,
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })
    const channel = JSON.parse(data)
    return channel.id
  }

  async login() {
    const {credentials} = this.options

    const uri = this.makeUri(`users/login`)
    const body = {
      login_id: credentials.username,
      password: credentials.password,
    }

    const data = await request({
      method: 'POST',
      uri,
      body,
      json: true,
      resolveWithFullResponse: true,
    })
    this.token = data.headers.token
  }

  async createPost(body) {
    const uri = this.makeUri(`posts`)
    const data = await request({
      method: 'POST',
      uri,
      body,
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      json: true,
    })
    return data
  }
}
