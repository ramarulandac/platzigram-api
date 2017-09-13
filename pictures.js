'use strict'

import { send, json } from 'micro'  // json allows to extract body from request
import HttpHash from 'http-hash'
import Db from 'platzigram-db'
import config from './config'
import utils from './lib/utils'
import DbStub from './test/stub/db'

  //  process.env.NODE_ENV  environment variable
const env = process.env.NODE_ENV || 'production'
let db = new Db(config.db)

if (env === 'test') {
  db = new DbStub()
}

const hash = HttpHash()

  //  Route difinition procedure ///////////////////////////////////

  // Route to list images by tag

hash.set('GET /tag/:tag', async function byTag (req, res, params) {
  let tag = params.tag
  await db.connect()
  let images = await db.getImagesByTag(tag)
  await db.disconnect()
  send(res, 200, images)
})

  // Route to list images

hash.set('GET /list', async function list (req, res, params) {
  await db.connect()
  let images = await db.getImages()
  await db.disconnect()
  send(res, 200, images)
})

  //  Route to get Image

hash.set('GET /:id', async function getPicture (req, res, params) {
  //  params to access para sent on the url.
  let id = params.id
  await db.connect()
 //  await para que retorne una promesa y pase el test. no de error de diferencias de objetos en el test
  let image = await db.getImage(id)
  await db.disconnect()
  send(res, 200, image)
})

//  Route to Post Image

hash.set('POST /', async function postPicture (req, res, params) {
  // json to extract body from request
  let image = await json(req)

  try {
    let token = await utils.extractToken(req)
    let encoded = await utils.verifyToken(token, config.secret)
    if (encoded && encoded.userId !== image.userId) {
      throw new Error('invalid token')
    }
  } catch (e) {
    return send(res, 401, {error: 'invalid token'})
  }
  await db.connect()
  let created = await db.saveImage(image)
  await db.disconnect()
  send(res, 201, created)
})

//  Route to Post Like Image

hash.set('POST /:id/like', async function likePicture (req, res, params) {
  let id = params.id
  await db.connect()
   //  await para que retorne una promesa y pase el test. no de error de diferencias de objetos en el test
  let image = await db.likeImage(id)
  await db.disconnect()
  send(res, 200, image)
})

export default async function main (req, res) {
  let { method, url } = req  // same as let method = req.method let url = req.url-->sintaxis object destructuring emacscript 6
  //  .get-> if there´s a route following the pattern returns the object for that route
  //  the route is what hash.set has set -> line 5
  let match = hash.get(`${method.toUpperCase()} ${url}`)

  if (match.handler) {
    // handler execution!
    try {
      await match.handler(req, res, match.params)
    } catch (e) {
      send(res, 500, {error: e.message})
    }
  } else {
    send(res, 404, {error: 'route not found'})  // micro functionality -> send
  }
}
