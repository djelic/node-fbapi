'use strict'

// Module dependencies.
var got = require('got')
var qs = require('querystring')
var crypto = require('crypto')
var extend = require('xtend')

module.exports = Facebook

function Facebook (options) {
  if (!(this instanceof Facebook)) return new Facebook(options)
  options || (options = {})
  this.clientId = options.client_id
  this.clientSecret = options.client_secret
  this.accessToken = options.access_token
  this.version = options.version || '2.5'
  this.rootUrl = 'https://graph.facebook.com'
  this.oauthUrl = 'http://www.facebook.com/dialog/oauth'
}

Facebook.prototype.get = function (endpoint, params) {
  return got(this.url(endpoint), {
    query: this.params(params),
    json: true
  }).then((res) => res.body)
}

Facebook.prototype.getAll = function (endpoint, params) {
  params = extend({ limit: 20 }, params)
  let data = []
  let next = function (result) {
    data = data.concat(result.data)
    let after = result.paging && result.paging.cursors.after
    if (!after || result.data.length <= params.limit) return data
    params = extend(params, { after: after })
    return this.get(endpoint, params).then(next)
  }.bind(this)
  return this.get(endpoint, params).then(next)
}

Facebook.prototype.getAuthUrl = function (params) {
  params = extend({ client_id: this.clientId }, params)
  return this.oauthUrl + '?' + qs.stringify(params)
}

Facebook.prototype.authorize = function (params) {
  params = extend({
    client_id: this.clientId,
    client_secret: this.clientSecret
  }, params)
  return this.get('/oauth/access_token', params)
}

Facebook.prototype.extendAccessToken = function (params) {
  params = extend({
    client_id: this.clientId,
    client_secret: this.clientSecret
  }, params)
  params.grant_type = 'fb_exchange_token'
  params.fb_exchange_token = params.access_token
  return this.get('/oauth/access_token', params)
}

Facebook.prototype.url = function (endpoint) {
  endpoint = endpoint[0] === '/' ? endpoint.substr(1) : endpoint
  return [this.rootUrl, 'v' + this.version, endpoint].join('/')
}

Facebook.prototype.params = function (params) {
  params = extend({}, params)
  if (params.access_token) {
    var hmac = crypto.createHmac('sha256', this.clientSecret)
    hmac.update(params.access_token)
    params.appsecret_proof = hmac.digest('hex')
  }
  return params
}
