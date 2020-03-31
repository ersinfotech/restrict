var _ = require('underscore')
var request = require('request-promise')

module.exports = function Restrict(options) {
  options = options || {}
  var baseUrl = options.baseUrl

  if (!baseUrl) {
    throw new Error('baseUrl required in restrict middleware')
  }

  return function restrict(permission) {
    return function restrictHandler(req, res, next) {
      var access_token

      if (req.query.access_token) {
        access_token = req.query.access_token
      } else if ((req.headers.authorization || '').indexOf('Bearer ') == 0) {
        access_token = req.headers.authorization.replace('Bearer', '').trim()
      } else {
        return res.status(400).send({ error: 'access_token required' })
      }

      // 檢查token有效性，獲得用戶id信息
      request({
        url: baseUrl + '/account/me/id',
        qs: { access_token: access_token },
        json: true,
      })
        .then(function(body) {
          var data = body || {}
          req.session = req.session || {}

          _.extend(req.session, data, {
            accessToken: access_token,
          })

          return next()
        })
        .catch(function(err) {
          res.status(400).send({ error: 'access_token invalid' })
        })
    }
  }
}
