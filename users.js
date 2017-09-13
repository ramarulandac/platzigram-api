'use strict'

// json allows to extract body from request
import { send, json } from 'micro'  // eslint-disable-line no-unused-vars
import HttpHash from 'http-hash'
import Db from 'platzigram-db'
import gravatar from 'gravatar'
import config from './config'
import DbStub from './test/stub/db'

  //  process.env.NODE_ENV  environment variable
const env = process.env.NODE_ENV || 'production'
let db = new Db(config.db)  // eslint-disable-line no-unused-vars

if (env === 'test') {
  db = new DbStub()
}

const hash = HttpHash()

  //  Route difinition procedure ///////////////////////////////////
hash.set('POST /', async function saveUser (req, res, params) {
  let user = await json(req)
  await db.connect()
  let created = await db.saveUser(user)
  //await db.disconnect()

  delete created.email
  delete created.password
  send(res, 201, created)
})

//  Route to get user  ///////////////////////////////////
hash.set('GET /:username', async function getUser (req, res, params) {
  let username = params.username
  await db.connect()
  let user = await db.getUser(username)
  user.avatar = gravatar.url(user.email)

  //await db.disconnect()
  let images = await db.getImagesByUser(username)
  user.pictures = images
  
  delete user.email
  delete user.password
  send(res, 200, user)
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
