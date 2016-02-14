'use strict';

// TODO: After each change to user, make sure you persist changes to db

let User = require('../../models/user');
let mongoose = require('mongoose');
class UserManager {
  constructor() {
    this.Model = User;
  }
  register(email, password, confirmPassword, callback) {
    if(password !== confirmPassword)
      callback(new Error('password and confirm password do not match'));

    let user = new User({
      email
    });
    user.setPassword(password, (err, registered) => {
      user.save(callback);
    });
  }

  findById(id, callback) {
    User.findById(id, (err, found) => {
      if(err)
        callback(err);
      if(!found)
        callback(new Error('user not found'));
      callback(null, found);
    });
  }

  findByEmail(email, callback) {
    User.findOne({ email }, (err, found) => {
      if(err)
        callback(err);
      if(!found)
        callback(new Error('user not found'));
      callback(null, found);
    });
  }

  setPasswordResetToken(email, notify, callback) {
    let needToNotify = false
    if(arguments.length == 2) {
      callback = notify;
      needToNotify = true;
    }
    this.findByEmail(email, (err, user) => {
      if(err)
        callback(err);
      user.setPasswordResetToken((err, token) => {
        if(err) callback(err);
        if(needToNotify) {
          notify(email, token, (err) => {
            if (err) callback(err);
            callback(null, token);
          })
        }
        else
          callback(null, token);
      })
    });
  }
}

'use strict';
let assert = require('assert');
mongoose.connect('localhost/test_users');

function clearCollection(callback) {
  User.remove({}, callback);
}

let userManager = new UserManager();



describe('user manager', () => {
  before((done) => {
    User.remove({}, done);
  });
  describe('registering a new user', () => {
    let user, error;
    beforeEach((beforeEachDone) => {
      clearCollection(() => {
        userManager.register('test@test.com', 'ValidPass1', 'ValidPass1', (err, registered) => {
          error = err;
          user = registered;
          beforeEachDone();
        });
      });
    });
    it('creates a user', (done) => {
      User.count((err, result) => {
        assert.equal(result, 1);
        done();
      });
    });

    it('user has email, hash, salt', () => {
      assert(user.hash);
      assert(user.email);
      assert(user.salt);
    })

    it('errors if user password ane confirm password do not match', (done) => {
      userManager.register('test1@test.com', 'ValidPass1', 'DoesnotMatch1', (registrationError, registered) => {
        assert(registrationError.message);
        done();
      });
    });

    it('errors if user email is not unique', (done) => {
      userManager.register('test@test.com', 'ValidPass1', 'ValidPass1', (registrationError, registered) => {
        console.log(registrationError);
        assert(registrationError.message);
        done();
      });
    });

  });

  // registers a new user
  // email, password, confirmPassword

  // TODO: .. if email is not a valid email, errors

  describe('operations with a user collections', () => {
    let user, error;
    beforeEach((beforeEachDone) => {
      clearCollection(() => {
        userManager.register('test@test.com', 'ValidPass1', 'ValidPass1', (err, registered) => {
          error = err;
          user = registered;
          beforeEachDone();
        });
      });
    });

    it('finds user by id', (done) => {
      userManager.findById(user._id, (err, found) => {
        assert(found);
        done();
      });
    });

    it('errors if tring to find  user by non-existent id', (done) => {
      userManager.findById('56c0be3f9e6711e311e771f2', (err, found) => {
        console.log(err);
        assert(err);
        done();
      });
    });

    it('finds user by email', (done) => {
      userManager.findByEmail(user.email, (err, found) => {
        assert(found);
        done();
      });
    });

    it('errors if no user found by email', (done) => {
      userManager.findByEmail(user.email + '1', (err, found) => {
        assert(err);
        done();
      });
    });

    it('sets user password (overload: by reset token)', (done) => {
      userManager.setPassword()
    })
    it('finds by reset email and sets reset token', (done) => {
      userManager.setPasswordResetToken(user.email, (err, token) => {
        console.log(token)
        assert(token);
        done();
      })
    });
  });
  // find user by
  // .. id
  // .. email
  // .. find by email and set reset token & return the token
  // .. find by reset token (exclude those with expired tokens)

  // find user by email & password, returning user object or id
  after((done) => {
    clearCollection(() => { done(); });
  })
})
