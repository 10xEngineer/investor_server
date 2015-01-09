'use strict';
 
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    _ = require('lodash');
 
exports.user = function (req, res, next, id) {
    User.findById(id, function (err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('Failed to load user ' + id));
        req.user = user;
        next();
    });
};
 
/**
 * Show a user
 */
exports.show = function(req, res) {
    res.json(req.user);
};
 
/**
 * List of users
 */
exports.all = function(req, res) {
    User.find().sort('-created').populate('user').exec(function(err, users) {
        if (err) {
            res.json(500, err);
        } else {
            res.json(users);
        }
    });
};
 
/**
 * Create a user
 */
exports.create = function(req, res) {
    var user = new User(req.body);

    user.save(function(err) {
        if (err) {
            return res.json(500, {
                errors: err.errors,
                user: user
            });
        } else {
            res.json(user);
        }
    });
};
 
/**
 * Update a user
 */
exports.update = function(req, res) {
    var user = req.user;
 
    user = _.extend(user, req.body);
 
    user.save(function(err) {
        if (err) {
            return res.json(500, {
                errors: err.errors,
                user: user
            });
        } else {
            res.json(user);
        }
    });
};
 
/**
 * Delete a user
 */
exports.destroy = function(req, res) {
    var user = req.user;
 
    user.remove(function(err) {
        if (err) {
            return res.json(500, {
                errors: err.errors,
                user: user
            });
        } else {
            res.json(user);
        }
    });
};

/**
 * Clear all users
 */
exports.clear = function(req, res) {
    User.collection.remove(function(err) {
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(200).json([]);
        }
    });
};

