'use strict';

var mongoose            = require('mongoose');
var UserModel           = require('../server/models/user.js').UserModel;
var ClientModel         = require('../server/models/client.js').ClientModel;
var PortfolioController = require('../server/controllers/portfolio_controller');
var PortfolioSchema     = require('../server/models/portfolio.js').PortfolioSchema;
var PortfolioModel      = mongoose.model('Portfolio', PortfolioSchema);
var AccessTokenModel    = require('../server/models/token.js').AccessTokenModel;
var RefreshTokenModel   = require('../server/models/token.js').RefreshTokenModel;
var faker               = require('faker');
var _ = require('lodash');
var logger = require('../logging').client,
    config = require('./config');
var q = require('q');
var default_user;

mongoose.connection.on('error', function(err, message) {
	logger.error('MONGOOSE error: '+JSON.stringify(err)+', '+JSON.stringify(message));
});


exports.cleanup = function (req, res) {
	var user;

	AccessTokenModel.remove({}, function (err) {
	    if (err) logger.error(err);
	});
	RefreshTokenModel.remove({}, function (err) {
	    if (err) logger.error(err);
	});
		
	UserModel.remove({}, function(err) {
	    user = new UserModel({ password: 'mypassword', name: 'Steve Messina', email: 'steve.g.messina@gmail.com' });
	    user.save(function(err, user) {
	        if(err) logger.error(err);
	        else logger.info('New admin - %s:%s:%s:%s:%s',user.email, user.password, user.name);
			default_user = user;
	    });
	    user = new UserModel({ password: 'mypassword', name: 'Sandy Peng', email: 'sandy.c.peng@gmail.com' });
	    user.save(function(err, user) {
	        if(err) logger.error(err);
	        else logger.info('New admin - %s:%s:%s:%s:%s',user.email, user.password, user.name);
	    });

	});

	ClientModel.remove({}, function(err) {
		var client;
	    client = new ClientModel({ name: 'Investor mobile client V1', clientType: 'mobile', clientId: 'InvestorMobilev1', clientSecret:'abc123456' });
	    client.save(function(err, client) {
	        if(err) logger.error(err);
	        else logger.info('New client device - %s:%s:%s', client.clientId, client.clientSecret, client.clientType);
	    });
	    client = new ClientModel({ name: 'Investor web client V1', clientType: 'web', clientId: 'InvestorWebv1', clientSecret:'alongssecretphrase' });
	    client.save(function(err, client) {
	        if(err) logger.error(err);
	        else logger.info('New client device - %s:%s:%s', client.clientId, client.clientSecret, client.clientType);
	    });
	});
	
	PortfolioModel.remove({}, function(err) {
		if (err) logger.error(err);
	});
	
	PortfolioModel.remove({}, function(err) {
		var portfolio;
	    portfolio = PortfolioController.createPortfolio({  name: 'Build Wealth Fund',
											stock_percentage_split: 0.5,
											customer: default_user._id,
											balance: 100000.0
								         }, function(err, merchant) {
									        if(err) return logger.error(JSON.stringify(err));
									        else logger.info('New merchant: '+JSON.stringify(merchant));
										}
								); 
	});


	res.status(200).end();
};

