'use strict';

var oauth2 = require('../../libs/oauth2'),
    _auth = require('../../libs/auth'),
    init_security = require('../../libs/init_security');

var users = require('../controllers/user_controller'),
    clients = require('../controllers/client_controller'),
    portfolios = require('../controllers/portfolio_controller'),
    transactions = require('../controllers/transaction_controller'),
   backoffice = require('../controllers/backoffice_ui_controller');

// MOCK var needsAuthentication = function(req, res, next) { next(); }; 
var needsAuthentication = _auth.passport.authenticate('bearer', { session: false }); 

// The Package is passed automatically as first parameter
module.exports = function(Api, app, auth, database) {

	app.use(_auth.passport.initialize());

	// HTML Views for registration, sign up, password reset
/*	app.get('/office/', backoffice.home_page);
	app.get('/office/login', backoffice.login_page);
	app.post('/office/login', backoffice.login);
	app.get('/office/signup', backoffice.signup_page);
	app.post('/office/signup', backoffice.signup);
	app.get('/office/registration', backoffice.registration_page);
	app.post('/office/registration', backoffice.registration);
	app.get('/office/registration_confirmation', backoffice.registration_confirmation_page);
	app.get('/office/logout', backoffice.logout);
	app.get('/office/forgot', backoffice.forgot_page);
	app.post('/office/forgot', backoffice.forgot);
	app.get('/office/forgot_confirmation', backoffice.forgot_confirmation_page);
	app.get('/office/reset/:token', backoffice.reset_page);
	app.post('/office/reset/:token', backoffice.reset)
	app.get('/office/merchant_profile', backoffice.merchant_profile_page);
	app.get('/office/user_profile', backoffice.user_profile_page);
	app.get('/office/admin', backoffice.admin_home_page);
	app.get('/office/map', backoffice.map_page);
	app.post('/office/drop_pin/:merchantId/', backoffice.drop_pin);
	app.get('/office/menu', backoffice.menu_page);
	app.post('/office/mailinglist_signup', backoffice.mailinglist_signup);
*/	
	// This API call is used to supply an OAuth token 
	// inputs
	// grant_type=passwprd
	// client_id=<client_id>
	// client_secret=<client_secret>
	// username=<user_id>
	// password=<user password>
	app.post('/api/oauth/token', oauth2.token);    
	
	// WARNING - testing only - HACK TODO
	app.post('/api/debug/reset', init_security.cleanup);

	// Payment confirmations
	app.route('/api/confirmations/email/:transactionId')
	  .post( needsAuthentication, portfolios.sendPaymentReceiptToEmail)
	
	// User API
	app.param('userId', users.user);
	app.route('/api/users')
	  .get( users.all )
	  .post( users.create )
	  .delete( users.clear );
	app.route('/api/users/:userId')
	  .get( users.show )
	  .put( users.update )
	  .delete( users.destroy );

	// Client API
	app.param('clientId', clients.client);
	app.route('/api/clients')
	  .get( needsAuthentication, clients.all )
	  .delete( needsAuthentication, clients.clear );
	app.route('/api/clients/:clientId')
	  .get( needsAuthentication, clients.show );

	// Portfolio API
	app.param('portfolioId', portfolios.portfolio);
	app.route('/api/portfolios')
	  .get( portfolios.all )
	  .post( portfolios.create )
	  .delete( portfolios.clear );
	app.route('/api/portfolios/:portfolioId')
	  .get( portfolios.show )
	  .put( portfolios.update )
	  .delete( portfolios.destroy );
	
	// Transaction API
	app.param('transactionId', transactions.transaction);
	app.route('/api/transactions')
	  .get( transactions.all )
	  .post( transactions.create )
	  .delete( transactions.clear );
	app.route('/api/transactions/:transactionId')
	  .get( transactions.show )
	  .put( transactions.update )
	  .delete( transactions.destroy );

};
