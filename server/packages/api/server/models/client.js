'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
  //crypto = require('crypto');
var supergoose = require('supergoose');

// Client
var ClientSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    clientId: {
        type: String,
        unique: true,
        required: true
    },
    clientType: {
	    type: String,
	    required: true,
	    unique: true
    },
    clientSecret: {
        type: String,
        required: true
    }
});

ClientSchema.plugin(supergoose, []);
var ClientModel = mongoose.model('Client', ClientSchema);
module.exports.ClientModel = ClientModel;