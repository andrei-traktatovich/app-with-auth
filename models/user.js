'use strict';
let mongoose = require('mongoose');
let crypto = require('crypto');
let moment = require('moment');

let UserSchema = mongoose.Schema({
    email : {
      type: String,
      required: true,
      unique: true
    },
    hash: {
      type: String,
      required: true
    },
    salt: {
      type: String,
      required: true
    },
    iterations: {
      type: Number,
      require: true
    },
    passwordResetToken: {
      type: String
    },
    resetTokenExpires: {
      type: Date
    }
  });

const DURATION_IN_DAYS = 1;

let encryptPassword = function(password, salt, iterations, callback)  {
  crypto.pbkdf2(password.trim(), salt, iterations, 64, 'sha512', (err, key) => {
    if (err) callback(err);
    callback(null, key.toString('hex'));
  });
};

UserSchema.methods.setPasswordResetToken = function(callback) {
  // TODO: provide a more reliable algorithm
  // TODO: refactor
  let randomString = Math.random() + Date().toString();
  let salt = Math.random().toString() + Date.now().toString();
  let iterations = Number.parseInt(Math.random() * 100) + 1;

  encryptPassword(randomString, salt, iterations, (err, hash) => {
    if(err)
      callback(err);

    this.passwordResetToken = hash;
    this.resetTokenExpires = moment().add(DURATION_IN_DAYS, 'days');
    
    callback(null, hash);
  });
}

UserSchema.methods.setPassword = function(value, callback) {
  if(!validate(value))
    callback(new Error('invalid password'));

  this.salt = Math.random().toString() + Date.now().toString();
  this.iterations = Number.parseInt(Math.random() * 100) + 1;

  encryptPassword(value, this.salt, this.iterations, (err, hash) => {
    if(err)
      callback(err);
    this.hash = hash;

    callback(null, hash);
    });
};

UserSchema.methods.checkPassword = function(pass, callback) {
  encryptPassword(pass, this.salt, this.iterations, (err, hash) => {
    if(err)
      callback(err);
    let result = hash === this.hash;
    callback(null, result);
  });
}
function validate(password) {
  return typeof password == 'string' && password.length > 0;
}
let UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
