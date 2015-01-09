'use strict';
 
var mongoose = require('mongoose'),
    Transaction = mongoose.model('Transaction'),
    Portfolio = mongoose.model('Portfolio'),
    User = mongoose.model('User'),
    _ = require('lodash');
 
exports.transaction = function (req, res, next, id) {
    Transaction.findById(id).populate('portfolio').exec(function (err, transaction) {
        if (err) return next(err);
        if (!transaction) return next(new Error('Failed to load transaction ' + id));
        req.transaction = transaction;
        next();
    });
};
 
/**
 * Show a transaction
 */
exports.show = function(req, res) {
    res.status(200).json(req.transaction);
};
 
/**
 * List of transactions
 */
exports.all = function(req, res) {
    Transaction.find()
	  .sort('-created')
	  .populate('portfolio')
	  .exec(function(err, transactions) {
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(200).json(transactions);
        }
    });
};
 
/**
 * Create a transaction
 */
exports.create = function(req, res, next) {
    var transaction = new Transaction(req.body);
    transaction.staff = req.user;

    transaction.save(function(err) {
        if (err) {
			console.log('error: '+err);
            return res.status(500).json({
                errors: err.errors,
                transaction: transaction
            });
        } else {
			transaction.populate('portfolio');
            res.status(200).json(transaction);
        }
    });
};
 
/**
 * Update a transaction
 */
exports.update = function(req, res) {
    var transaction = req.transaction;
 
    transaction = _.extend(transaction, req.body);
 
    transaction.save(function(err) {
        if (err) {
            return res.status(500).json({
                errors: err.errors,
                transaction: transaction
            });
        } else {
            res.status(200).json(transaction);
        }
    });
};
 
/**
 * Delete a transaction
 */
exports.destroy = function(req, res) {
    var transaction = req.transaction;
 
    transaction.remove(function(err) {
        if (err) {
            return res.status(500).json({
                errors: err.errors,
                transaction: transaction
            });
        } else {
            res.status(200).json(transaction);
        }
    });
};

/**
 * Clear all transactions
 */
exports.clear = function(req, res) {
    Transaction.collection.remove(function(err) {
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(200).json([]);
        }
    });
};