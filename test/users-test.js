'use strict'

import test from 'ava'
import micro from 'micro'
//  import uuid from 'uuid-base62'
import listen from 'test-listen'  //  Testing microservices with micro
import request from 'request-promise'  //  http request using promises
import users from '../users.js'
import fixtures from './fixtures'

//  launches microservice for each test
test.beforeEach(async t => {
  //  micro launches the micro server
  let srv = micro(users)
  //  listen return url:port from server executed by micro-> line 13
  t.context.url = await listen(srv)
})
//  Test saveUser
test('POST /', async t => {
  let user = fixtures.getUser()
  let url = t.context.url

  let options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      name: user.name,
      username: user.username,
      password: user.password,
      email: user.email
    },
    resolveWithFullResponse: true
  }
  let response = await request(options)

  delete user.email
  delete user.password

  t.is(response.statusCode, 201)
  t.deepEqual(response.body, user)
})
//  Test get user
test('GET /:username', async t => {
  let url = t.context.url
  let user = fixtures.getUser()

  let options = {
    method: 'GET',
    uri: `${url}/${user.username}`,
    json: true
  }

  let body = await request(options)

  delete user.email
  delete user.password

  t.deepEqual(body, user)
})
