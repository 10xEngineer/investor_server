'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
  //crypto = require('crypto');

// AccessToken
var AccessTokenSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    clientId: {
        type: String,
        required: true
    },
    token: {
        type: String,
        unique: true,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    }
});

AccessTokenSchema.pre('save', function(next) {
  if (this.isNew) {
    this.created = Date.now();
  }
  this.updated = Date.now();
  next();
});

var AccessTokenModel = mongoose.model('AccessToken', AccessTokenSchema);

// RefreshToken
var RefreshTokenSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    clientId: {
        type: String,
        required: true
    },
    token: {
        type: String,
        unique: true,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    }
});

RefreshTokenSchema.pre('save', function(next) {
  if (this.isNew) {
    this.created = Date.now();
  }
  this.updated = Date.now();
  next();
});
	

var RefreshTokenModel = mongoose.model('RefreshToken', RefreshTokenSchema);

module.exports.AccessTokenModel = AccessTokenModel;
module.exports.RefreshTokenModel = RefreshTokenModel;