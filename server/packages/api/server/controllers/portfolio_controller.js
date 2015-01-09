'use strict';
 
var mongoose = require('mongoose'),
    Portfolio = mongoose.model('Portfolio'),
    Transaction = mongoose.model('Transaction'),
    config = require('../../libs/config'),
    mailchimp_controller = require('./mailchimp_controller'),
    io = require('../../../../server.js').socket,
    _ = require('lodash');
var logger = require('../../logging').client;

Date.prototype.yyyymmdd = function() {
        var yyyy = this.getFullYear().toString();                                    
        var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based         
        var dd  = this.getDate().toString();
        return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
};

mongoose.connection.on('error', function(err) {
	logger.error('mongoose error: '+err, ['portfolio','error' ] );
});


exports.sendPaymentReceiptToEmail = function(req, res) {
	var transactionId = req.body && req.body.transactionId || req.params && req.params.transactionId;
	var email = req.body && req.body.email || req.params && req.params.email;

	Transaction.findOne({ _id: transactionId }).populate('portfolio').exec(function (err, transaction) {
		mailchimp_controller.sendTemplateEmail(
			'Receipt', 
			email, 
			'Thank you for your custom.', 
			'', 
			[
				{name: 'bank', content: transaction.bank},
				{name: 'portfolio', content: transaction.portfolio.name},
				{name: 'amount', content: transaction.amount}
			], 
			function(err, result) {
				if (err) {
					logger.error('email send error: '+JSON.stringify(err));
					res.status(500).json({errors: {error: err}});
				};
				//req.flash('info', 'A receipt e-mail has been sent to ' + user.email + ' with confirmation.');
				logger.info('A receipt e-mail has been sent to ' + 'notifications@ucanpay.io' + ' with further confirmation.');
				res.status(200).json(result);
			}
		);
	});
};

exports.portfolio = function (req, res, next, id) {
    Portfolio.findById(id, function (err, portfolio) {
        if (err) return next(err);
        if (!portfolio) return next(new Error('Failed to load portfolio ' + id));
       	req.portfolio = portfolio;
        next();
    });
};
 
/**
 * Show a portfolio
 */
exports.show = function(req, res) {
   	res.status(200).json(req.portfolio);
};
 
/**
 * List of portfolios
 */
exports.all = function(req, res) {
    Portfolio.find().sort('-created').populate('portfolio user transactions').exec(function(err, portfolios) {
        if (err) {
			logger.error('portfolio.all error: '+JSON.stringify(err), ['portfolio','all'])
            res.status(500).json({errors: {error: err}});
        } else {
            res.status(200).json(portfolios);
        }
    });
};


/**
 * Create a portfolio
 */
exports.create = function(req, res) {
	var _portfolio = req.body || req.params;
	logger.debug('new portfolio: '+JSON.stringify(_portfolio), ['portfolio','debug','create' ] );
    Portfolio.findOrCreate({name: _portfolio.name}, _portfolio, [{upsert: true}], function(err, portfolio) {
		if (err) {
			logger.error('error while creating portfolio: '+JSON.stringify(err), ['portfolio','error','create' ] );
			return{errors: {error: err}, requested_portfolio: _portfolio};
		} else {
			logger.debug('portfolio found/create: '+JSON.stringify(portfolio), ['portfolio','debug','create' ] );
		    portfolio.name = _portfolio.name;
			portfolio.customer = _portfolio.customer;
			portfolio.allocations.push([
				{
				    "balance": 100000,
				    "stock_percentage_split": 0.5,
				    "customer": 0,
				    "allocations": [
				        {
				            "name": "USTotalStockMarket",
				            "allocation": 0.5
				        },
				        {
				            "name": "USLargeCapValue",
				            "allocation": 0
				        },
				        {
				            "name": "USMidCapValue",
				            "allocation": 0
				        },
				        {
				            "name": "USSmallCapValue",
				            "allocation": 0
				        },
				        {
				            "name": "InternationalDeveloped",
				            "allocation": 0
				        },
				        {
				            "name": "EmergingMarkets",
				            "allocation": 0
				        },
				        {
				            "name": "Short-TermTreasuries",
				            "allocation": 0.5
				        },
				        {
				            "name": "Inflation-ProtectedBonds",
				            "allocation": 0
				        },
				        {
				            "name": "USMunicipalBonds",
				            "allocation": 0
				        },
				        {
				            "name": "USCorporateBonds",
				            "allocation": 0
				        },
				        {
				            "name": "InternationalBonds",
				            "allocation": 0
				        },
				        {
				            "name": "EmergingMarketsBonds",
				            "allocation": 0
				        }
				    ]
				}
			]);
			portfolio.balance = _portfolio.balance;
			logger.debug('Saving portfolio: '+JSON.stringify(portfolio));    
			portfolio.save(function(err) {
			    logger.debug('portfolio saved.. err?='+JSON.stringify(err));
		        if (err) {
					logger.error('portfolio_controller.portfolio update error: '+JSON.stringify(err), ['portfolio','error','create' ] );
		            res.status(500).json( {errors: {error: err}} );
		        } else {
					logger.debug('returning portfolio: '+JSON.stringify(portfolio), ['portfolio','debug','create' ] );
		            res.status(200).json( portfolio );
		        }
		    });
		}
	});
};

/**
 * Update a portfolio
 */
exports.update = function(req, res) {
    var portfolio = req.portfolio;
 
    portfolio = _.extend(portfolio, req.body);
 
    portfolio.save(function(err) {
        if (err) {
            return res.status(500).json({
                errors: {error: err.errors},
                portfolio: portfolio
            });
        } else {
            res.status(200).json(portfolio);
        }
    });
};
 
/**
 * Delete a portfolio
 */
exports.destroy = function(req, res) {
    var portfolio = req.portfolio;
 
    portfolio.remove(function(err) {
        if (err) {
            return res.json(500, {
                errors: {error: err.errors},
                portfolio: portfolio
            });
        } else {
            res.json(portfolio);
        }
    });
};

/**
 * Clear all portfolios
 */
exports.clear = function(req, res) {
    Portfolio.collection.remove(function(err) {
        if (err) {
            res.status(500).json({errors: {error: err}});
        } else {
            res.status(200).json([]);
        }
    });
};
