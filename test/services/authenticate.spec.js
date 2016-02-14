'use strict';

var sinon = require('sinon');
var assert = require('assert');
let authenticator = require('../../middleware/authenticate-user');

describe('when authenticating user', () => {
  describe('if no req.session.user is present', () => {
    var authenticate,
        req = {},
        next,
        redirect,
        config = {};
    before(() => {
      config = {
        login: '/login',
        deserializeUser: sinon.spy()
      };
      authenticate = authenticator(config);
      redirect = sinon.spy();
      authenticate(req, { redirect: redirect }, next);
    });

    it('redirects to login path', () => {
      assert(redirect.calledWith('/login'));
    });
  })

  describe('if req.session.user is present', () => {
    var authenticate,
        req = { session : { user: 1 }},
        next,
        config;

    function deserializeUserSuccess(user, callback) {
      callback(null, {});
    }
    function deserializeUserReturningNull(user, callback) {
      callback(null, null);
    }
    function deserializeUserFailure(user, callback) {
      callback(new Error());
    }

    before(() => {
      config = {
        deserializeUser: sinon.spy(deserializeUserSuccess)
      };
      authenticate = authenticator(config);
      next = sinon.spy();
      authenticate(req, {}, next);
    });

    it('call user deserialization callback', () => {
      assert(config.deserializeUser.calledWith(1));
    });

    describe('if user is found', () => {
      it('if user is found, call next()', () => {
        assert(next.called && next.args[0].length == 0);
      });
    });

    describe('if deserialization fails', () => {
      before(() => {
        config = {
          deserializeUser: sinon.spy(deserializeUserFailure)
        };
        authenticate = authenticator(config);
        next = sinon.spy();
        authenticate(req, {}, next);
      });

      it('if deserialization fails, call next(err)', () => {
        assert(next.called && next.args[0][0] instanceof Error);
      });
    });

    describe('if deserialization finds no user', () => {
      before(() => {
        config = {
          deserializeUser: sinon.spy(deserializeUserReturningNull)
        };
        authenticate = authenticator(config);
        next = sinon.spy();
        authenticate(req, {}, next);
      });

      it('if deserialization fails, returns status 401', () => {
        assert(next.called && next.args[0][0].status === 401);
      });
    });
  });

});
