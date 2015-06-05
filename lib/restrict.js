//
// ers auth middleware
//

var request = require('superagent');
var _ = require('underscore');

module.exports = function Restrict (options) {
  options = options || {};
  var baseUrl = options.baseUrl;

  if (! baseUrl) {
    throw new Error('baseUrl required in restrict middleware');
  };

  return function restrict (permission) {
    return function restrictHandler (req, res, next) {
      var access_token;

      if (req.query.access_token) {
        access_token  = req.query.access_token;
      } else if ((req.headers.authorization || '').indexOf('Bearer ') == 0) {
        access_token = req.headers.authorization.replace('Bearer', '').trim();
      } else {
        return res.status(400).send({error: 'access_token required'});
      };

      // 檢查token有效性，獲得用戶id信息
      request.get(baseUrl + '/account/me/id')
      .query({access_token: access_token})
      .end(function agentHandler (err, response) {
        if (err) {
          return res.status(400).send({error: 'access_token fetching error'});
        };

        if (response.error) {
          return res.status(400).send({error: 'access_token invalid'});
        };

        var data = response.body || {};
        req.session = req.session || {};

        _.extend(req.session, {
          userId: data.user_id,
          groupId: data.group_id,
          productId: data.product_id,
        });

        if (! permission) {
          return next();
        };

        // 檢本permission
        request.get(baseUrl + '/account/me/permissions')
        .query({access_token: access_token})
        .end(function agentHandler (err, response) {
          if (err) {
            return res.status(400).send({error: 'access_token fetching error'});
          };

          if (response.error) {
            return res.status(400).send({error: 'access_token invalid'});
          };

          var permissions = req.session.permissions = response.body;

          if (! _.isArray(permissions)) {
            permissions = _.keys(permissions);
          };

          if (! _.contains(permissions, permission)) {
            return res.status(400).send({error: 'permission required'});
          };

          next();
        });
      });
    }
  }
}