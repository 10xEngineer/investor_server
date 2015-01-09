'use strict';

var config                  = require('./config');
var logger                  = require('../logging').client;
var passport                = require('passport');
var LocalStrategy           = require('passport-local').Strategy;
var BasicStrategy           = require('passport-http').BasicStrategy;
var ClientPasswordStrategy  = require('passport-oauth2-client-password').Strategy;
var GoogleStrategy          = require('passport-google-oauth').OAuth2Strategy;
var BearerStrategy          = require('passport-http-bearer').Strategy;
var UserModel               = require('../server/models/user.js').UserModel;
var ClientModel             = require('../server/models/client.js').ClientModel;
var AccessTokenModel        = require('../server/models/token.js').AccessTokenModel;

// Used by Back Office
passport.use(new LocalStrategy(function(username, password, done) {
  logger.info('passport local: username: '+username+', password: '+password);
  UserModel.findOne({ username: username }, '+hashedPassword', function(err, user) {
    if (err) {
		logger.error('passport-local: find user error: '+JSON.stringify(err));
		return done(err);
	};
    if (!user) {
		logger.error('passport-local: No user found for this username');
		return done(null, false, { message: 'Incorrect username.' });
	};
    if (user.checkPassword(password) ) {
	    logger.info('passport-local: user logged in. '+JSON.stringify(user));
        return done(null, user);
      } else {
	    logger.error('passport-local: Incorrect password');
        return done(null, false, { message: 'Incorrect password.' });
      }
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  UserModel.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new BasicStrategy(
    function(username, password, done) {
        ClientModel.findOne({ clientId: username }, function(err, client) {
            if (err) { return done(err); }
            if (!client) { return done(null, false); }
            if (client.clientSecret !== password) { return done(null, false); }

            return done(null, client);
        });
    }
));

passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {
        ClientModel.findOne({ clientId: clientId }, function(err, client) {
            if (err) { return done(err); }
            if (!client) { return done(null, false); }
            if (client.clientSecret !== clientSecret) { return done(null, false); }

            return done(null, client);
        });
    }
));

passport.use(new BearerStrategy(
    function(accessToken, done) {
        AccessTokenModel.findOne({ token: accessToken }, function(err, token) {
            if (err) { return done(err); }
            if (!token) { return done(null, false); }

            if( Math.round((Date.now()-token.created)/1000) > config.security.tokenLife ) {
                AccessTokenModel.remove({ token: accessToken }, function (err) {
                    if (err) return done(err);
                });
                return done(null, false, { message: 'Token expired' });
            }

            UserModel.findById(token.userId, '+hashedPassword', function(err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false, { message: 'Unknown user' }); }

                var info = { scope: '*' };
                done(null, user, info);
            });
        });
    }
));

exports.passport = passport;