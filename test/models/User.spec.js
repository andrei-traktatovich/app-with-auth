'use strict';

let mongoose = require('mongoose');
let User = require('../../models/user');
let assert = require('assert');

describe('User Model', () => {
  let password = 'theTestPassword', user, hash;
  beforeEach((done) => {
    user = new User();
    user.setPassword(password, (err, newPassword) => {
      hash = newPassword;
      done();
    });
  });

  it('sets encrypted password hash', () => {
    assert(user.hash.length > 0);
  });

  it('trims the password', (done) => {
    user.checkPassword(' ' + password + ' ', (err, result) => {
      assert.equal(true, result);
      done();
    })
  });

  it('returns true if password matches', (done) => {
    user.checkPassword(password, (err, result) => {
      assert.equal(null, err);
      assert.equal(true, result);
      done();
    });
  });

  it('returns false if password does not match', (done) => {
    user.checkPassword('wrong password', (err, result) => {
      assert.equal(null, err);
      assert.equal(false, result);
      done();
    });
  });

  describe('when setting password reset token', () => {
    let theToken;
    let user;
    before((done) => {
      user = new User();
      user.setPasswordResetToken((err, token) => {
        theToken = token;

        done();
      });
    });

    it('returns token', () => {
      
      assert.equal(user.passwordResetToken, theToken);
    });
    it('sets user token', () => {
      assert(user.passwordResetToken)
    })
    it('sets token expiration date', () => {
      assert(user.resetTokenExpires)
    })

  });
});
