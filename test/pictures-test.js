'use strict'

import test from 'ava'
import micro from 'micro'
//  import uuid from 'uuid-base62'
import listen from 'test-listen'  //  Testing microservices with micro
import request from 'request-promise'  //  http request using promises
import pictures from '../pictures.js'
import fixtures from './fixtures'
import utils from '../lib/utils'
import config from '../config'

//  launches microservice for each test
test.beforeEach(async t => {
  //  micro launches the micro server
  let srv = micro(pictures)
  //  listen return url:port from server executed by micro-> line 13
  t.context.url = await listen(srv)
})

  //  No token post
test('no token POST /', async t => {
  let image = fixtures.getImage()
  let url = t.context.url

  let options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      description: image.description,
      src: image.src,
      userId: image.userId
    },
    resolveWithFullResponse: true  //  1 - option to obtain the whole object response in order to test that the http code response is 201
  }  //  2 - by default request promise just returns the body of the response.

  await t.throws(request(options), /invalid token/)
})
//  Secure post
test('secure POST /', async t => {
  let image = fixtures.getImage()
  let url = t.context.url
  let token = await utils.signToken({ userId: image.userId }, config.secret)

  let options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      description: image.description,
      src: image.src,
      userId: image.userId
    },
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true  //  1 - option to obtain the whole object response in order to test that the http code response is 201
  }  //  2 - by default request promise just returns the body of the response.

  let response = await request(options)
  t.is(response.statusCode, 201)
  t.deepEqual(response.body, image)
})

//  invalid token post
test('invalid token POST /', async t => {
  let image = fixtures.getImage()
  let url = t.context.url
  let token = await utils.signToken({ userId: 'hacky' }, config.secret)

  let options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      description: image.description,
      src: image.src,
      userId: image.userId
    },
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true  //  1 - option to obtain the whole object response in order to test that the http code response is 201
  }  //  2 - by default request promise just returns the body of the response.

  await t.throws(request(options), /invalid token/)
})

test('POST /:id/like', async t => {
  let image = fixtures.getImage()
  let url = t.context.url

  let options = {
    method: 'POST',
    uri: `${url}/${image.id}/like`,
    json: true
  }

  let body = await request(options)
  let imageNew = JSON.parse(JSON.stringify(image))
  imageNew.liked = true
  imageNew.likes = 1

  t.deepEqual(body, imageNew)
})

test('GET /list', async t => {
  let images = fixtures.getImages()
  let url = t.context.url

  let options = {
    method: 'GET',
    uri: `${url}/list`,
    json: true
  }

  let body = await request(options)
  t.deepEqual(body, images)
})

//  testing micro: 'GET /_id' --> ruta para obtener imagen por id
test('GET /:id', async t => {
  let image = fixtures.getImage()

  let url = t.context.url
  //  execute http request
  let body = await request({uri: `${url}/${image.publicId}`, json: true})
  t.deepEqual(body, image)
})

test('GET /tag/:tag', async t => {
  let images = fixtures.getImagesByTag()
  let url = t.context.url

  let options = {
    method: 'GET',
    uri: `${url}/tag/awesome`,
    json: true
  }

  let body = await request(options)
  t.deepEqual(body, images)
})
