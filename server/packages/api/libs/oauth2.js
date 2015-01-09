'use strict';

var oauth2orize         = require('oauth2orize');
var passport            = require('passport');
var crypto              = require('crypto');
var config              = require('./config');
var UserModel           = require('../server/models/user.js').UserModel;
//var ClientModel         = require('../server/models/client.js').ClientModel;
var AccessTokenModel    = require('../server/models/token.js').AccessTokenModel;
var RefreshTokenModel   = require('../server/models/token.js').RefreshTokenModel;

// create OAuth 2.0 server
var server = oauth2orize.createServer();

// Exchange username & password for access token.
server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
    UserModel.findOne({ username: username }, '+hashedPassword', function(err, user) {
        //console.log('oauth err: '+JSON.stringify(err));
        //console.log('oauth user: ('+username+')'+JSON.stringify(user));
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.checkPassword(password)) { return done(null, false); }

        RefreshTokenModel.remove({ userId: user.userId, clientId: client.clientId }, function (err) {
            if (err) return done(err);
        });
        AccessTokenModel.remove({ userId: user.userId, clientId: client.clientId }, function (err) {
            if (err) return done(err);
        });

        var tokenValue = crypto.randomBytes(32).toString('base64');
        var refreshTokenValue = crypto.randomBytes(32).toString('base64');
        var token = new AccessTokenModel({ token: tokenValue, clientId: client.clientId, userId: user.userId });
        var refreshToken = new RefreshTokenModel({ token: refreshTokenValue, clientId: client.clientId, userId: user.userId });
        refreshToken.save(function (err) {
            if (err) { return done(err); }
        });
        //var info = { scope: '*' };
        token.save(function (err, token) {
            if (err) { return done(err); }
			// just enough user info to assist the client, which barfs on seeing the non string chars of the hashed password
            done(null, tokenValue, refreshTokenValue, { 'expires_in': config.security.tokenLife, user: {_id: user._id, merchant: user.merchant, userType: user.userType}});
        });
    });
}));

// Exchange refreshToken for access token.
server.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done) {
    RefreshTokenModel.findOne({ token: refreshToken }, function(err, token) {
        if (err) { return done(err); }
        if (!token) { return done(null, false); }
        if (!token) { return done(null, false); }

        UserModel.findById(token.userId, '+hashedPassword', function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }

            RefreshTokenModel.remove({ userId: user.userId, clientId: client.clientId }, function (err) {
                if (err) return done(err);
            });
            AccessTokenModel.remove({ userId: user.userId, clientId: client.clientId }, function (err) {
                if (err) return done(err);
            });

            var tokenValue = crypto.randomBytes(32).toString('base64');
            var refreshTokenValue = crypto.randomBytes(32).toString('base64');
            var token = new AccessTokenModel({ token: tokenValue, clientId: client.clientId, userId: user.userId });
            var refreshToken = new RefreshTokenModel({ token: refreshTokenValue, clientId: client.clientId, userId: user.userId });
            refreshToken.save(function (err) {
                if (err) { return done(err); }
            });
            //var info = { scope: '*' };
            token.save(function (err, token) {
                if (err) { return done(err); }
                done(null, tokenValue, refreshTokenValue, { 'expires_in': config.security.tokenLife, user: user._id});
            });
        });
    });
}));

// token endpoint
exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    server.token(),
    server.errorHandler()
];