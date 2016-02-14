let Router = require('express').Router;
let login = require('./login');
let authenticate = require('../services/authenticate');

function configureRoutes(app, User) {

  app.use('/login', login);

  app.use('/', (req, res, next) => {
    res.render('index');
  });

  let config = {
    login: './login',
    User.findById
  };

  app.use('/members', authenticate(config), (req,res) => {
    res.send('members-area ...');
  });

}

module.exports = configureRoutes;
