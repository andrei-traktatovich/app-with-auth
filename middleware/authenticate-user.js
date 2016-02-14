'use strict';

var setError = require("../utilities/set-error");

let authenticator = function(config) {
  let login = config.login || '/login';

  if (typeof config.deserializeUser !== 'function')
    throw new Error('cannot deserialize user');

  return (req, res, next) => {
    if(req.session && req.session.user) {
      config.deserializeUser(req.session.user, (err, user) => {
        if (user) {
          req.user = user;
          next();
        } else
          next(setError(401));
      });
    } else
      res.redirect(login);
  }
}

module.exports = authenticator;
