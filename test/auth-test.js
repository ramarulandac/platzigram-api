'use strict'

import test from 'ava'
import micro from 'micro'
//  import uuid from 'uuid-base62'
import listen from 'test-listen'  //  Testing microservices with micro
import request from 'request-promise'  //  http request using promises
import auth from '../auth.js'
import fixtures from './fixtures'
import config from '../config'
import utils from '../lib/utils'

//  launches microservice for each test
test.beforeEach(async t => {
  //  micro launches the micro server
  let srv = micro(auth)
  //  listen return url:port from server executed by micro-> line 13
  t.context.url = await listen(srv)
})
//  Test Post - autentication
test('success POST', async t => {
  let user = fixtures.getUser()
  let url = t.context.url
  let options = {
    method: 'POST',
    uri: url,
    body: {
      username: user.username,
      password: user.password
    },
    json: true
  }

  let token = await request(options)
  let decoded = await utils.verifyToken(token, config.secret)

  t.is(decoded.username, user.username)
})
