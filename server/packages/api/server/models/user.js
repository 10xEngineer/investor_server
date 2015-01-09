'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  crypto = require('crypto');
var supergoose = require('supergoose');

// User
var UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
//        match: [/.+\@.+\..+/, 'Please enter a valid email'],
//        validate: [validateUniqueEmail, 'E-mail address is already in-use']
    },
    bank: {
        type: String,
        required: true,
		default: ''
    },
    hashedPassword: {
        type: String,
        required: true,
        select: false
    },
    salt: {
        type: String,
        required: true
    },
    resetPasswordToken: {
	    type: String,
	    required: false
	},
    resetPasswordExpires: {
	    type: Date,
	    required: false
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

UserSchema.methods.encryptPassword = function(password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 512);
};

UserSchema.virtual('userId')
    .get(function () {
        return this.id;
    });

UserSchema.virtual('password')
    .set(function(password) {
        this._plainPassword = password || 'mypassword';
        this.salt = crypto.randomBytes(32).toString('base64');
        this.hashedPassword = this.encryptPassword(this._plainPassword);
    })
    .get(function() { return this._plainPassword; });


UserSchema.methods.checkPassword = function(password) {
    return this.encryptPassword(password) == this.hashedPassword;
};

UserSchema.pre('save', function(next) {
  if (this.isNew) {
    this.created = Date.now();
  }
  this.updated = Date.now();
  next();
});

UserSchema.plugin(supergoose, []);
UserSchema.set('autoIndex', true);
var UserModel = mongoose.model('User', UserSchema);
module.exports.UserModel = UserModel;