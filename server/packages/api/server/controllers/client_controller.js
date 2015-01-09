'use strict';

/*
This controller is for mobile / web etc clients
*/
var mongoose = require('mongoose'),
    Client = mongoose.model('Client'),
    _ = require('lodash');
 
exports.client = function (req, res, next, id) {
    Client.findById(id, function (err, client) {
        if (err) return next(err);
        if (!client) return next(new Error('Failed to load client ' + id));
        req.client = client;
        next();
    });
};
 
/**
 * Show a client
 */
exports.show = function(req, res) {
    res.json(req.client);
};
 
/**
 * List of clients
 */
exports.all = function(req, res) {
    Client.find().sort('-created').populate('client').exec(function(err, clients) {
        if (err) {
            res.json(500, err);
        } else {
            res.json(clients);
        }
    });
};
 
/**
 * Create a client
 */
exports.create = function(req, res) {
    var client = new Client(req.body);
    client.name = req.body.name;
	client.clientId = _.assign(req.body.clientId);
	client.clientSecret = req.body.clientSecret; 
	
    client.save(function(err) {
        if (err) {
            return res.json(500, {
                errors: err.errors,
                client: client
            });
        } else {
            res.json(client);
        }
    });
};
 
/**
 * Update a client
 */
exports.update = function(req, res) {
    var client = req.client;
 
    client = _.extend(client, req.body);
 
    client.save(function(err) {
        if (err) {
            return res.json(500, {
                errors: err.errors,
                client: client
            });
        } else {
            res.json(client);
        }
    });
};
 
/**
 * Delete a client
 */
exports.destroy = function(req, res) {
    var client = req.client;
 
    client.remove(function(err) {
        if (err) {
            return res.json(500, {
                errors: err.errors,
                client: client
            });
        } else {
            res.json(client);
        }
    });
};

/**
 * Clear all clients
 */
exports.clear = function(req, res) {
    Client.collection.remove(function(err) {
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(200).json([]);
        }
    });
};