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
      var access_token  = req.query.access_token;

      if (! access_token) {
        return res.status(400).send({error: 'access_token required'});
      };

      request
      .get(baseUrl + '/account/id')
      .query({access_token: access_token})
      .end(function agentHandler (err, response) {
        if (err) {
          return next(err);
        };

        var data = response.body || {};
        var permissions = data.permissions;

        if (permission && ! _.contains(permissions, permission)) {
          return res.status(400).send({error: 'permission required'});
        };

        _.extend(req.session, {
          userId: data.user_id,
          groupId: data.group_id,
          productId: data.product_id,
          permissions: data.permissions
        });

        next();
      })
    }
  }
}