'use strict'

// json allows to extract body from request
import { send, json } from 'micro'  // eslint-disable-line no-unused-vars
import HttpHash from 'http-hash'
import Db from 'platzigram-db'
import config from './config'
import utils from './lib/utils'
import DbStub from './test/stub/db'

  //  process.env.NODE_ENV  environment variable
const env = process.env.NODE_ENV || 'production'
let db = new Db(config.db)  // eslint-disable-line no-unused-vars

if (env === 'test') {
  db = new DbStub()
}

const hash = HttpHash()

hash.set('POST /', async function authenticate (req, res, params) {
  let credentials = await json(req)
  await db.connect()
  let auth = await db.authenticate(credentials.username, credentials.password)
  await db.disconnect()

  if (!auth) {
    return send(res, 401, {error: 'invalid credetentials'})
  }

  let token = await utils.signToken({
    username: credentials.username
  }, config.secret)

  send(res, 200, token)
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
      send(res, 500, {error: e.message + 'yum2'})
    }
  } else {
    send(res, 404, {error: 'route not found'})  // micro functionality -> send
  }
}
