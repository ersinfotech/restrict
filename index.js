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

          _.extend(req.session, {
            userId: String(data.user_id),
            groupId: String(data.group_id),
            productId: String(data.product_id),
            roleId: String(data.role_id),
            lang: data.lang,
            paid: data.paid,
            accessToken: access_token,
          })

          if (!permission) {
            return next()
          }

          // 檢本permission
          return request({
            url: baseUrl + '/account/me/permissions',
            qs: { access_token: access_token },
            json: true,
          }).then(function(body) {
            var permissions = (req.session.permissions = body)

            if (!_.isArray(permissions)) {
              permissions = _.keys(permissions)
            }

            if (!_.contains(permissions, permission)) {
              return res.status(400).send({ error: 'permission required' })
            }

            next()
          })
        })
        .catch(function(err) {
          res.status(400).send({ error: 'access_token invalid' })
        })
    }
  }
}
