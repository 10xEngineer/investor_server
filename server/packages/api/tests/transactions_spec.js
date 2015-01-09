'use strict';
var frisby = require('frisby');
var Schema = require('mongoose').Schema;

var domain         = process.env.server || 'http://localhost:3000/',
    oauthTokenUrl  = domain + 'api/oauth/token',
    client_id      = 'UcanPayATMv1',
    client_secret  = 'abc123456',
    username       = 'stevem',
    password       = 'mypassword';

console.log('oauthTokenUrl: '+oauthTokenUrl);

frisby.create('OAuth2 login')
  .addHeader('Content-Type', 'application/x-www-form-urlencoded')
  .post(oauthTokenUrl, {
    grant_type: 'password',
    client_id: client_id,
    client_secret: client_secret,
    username: username,
    password: password
  })
  .expectStatus(200)
  .afterJSON(function(response) {
	var requestToken = response.access_token;
	console.log('access token: '+requestToken);
	
	frisby.create('Empty Transactions list')
	  .delete('http://localhost:3000/api/transactions')
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	  .expectJSONLength(0)
	  //.inspectJSON()
	.toss();

	frisby.create('Check Transactions list is empty')
	  .get('http://localhost:3000/api/transactions')
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	  .expectJSONLength(0)
	  //.inspectJSON()
	.toss();

	frisby.create('Create New Transaction')
	  .post('http://localhost:3000/api/transactions', {
	      transaction_type: 'sale',
	      hkd_price: 150.00,
	      btc_price: 0.04073,
		  status: 'unconfirmed',
		  merchant_wallet: '53f57c9e53a5dcb08f96b2cb',
		  customer_wallet: '53f57c9e53a5dcb08f96b2cb',
		  customer: '53f57c9e53a5dcb08f96b2cb',
		  merchant: '53f57c9e53a5dcb08f96b2cb',
		  invoice: '53f57c9e53a5dcb08f96b2cb'
	    })
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	.toss();

	frisby.create('Check Transaction is created')
	  .get('http://localhost:3000/api/transactions')
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	  .expectJSON('0', {
	      transaction_type: 'sale',
	      hkd_price: 150.00,
	      btc_price: 0.04073,
		  status: 'unconfirmed',
		  merchant_wallet: '53f57c9e53a5dcb08f96b2cb',
		  customer_wallet: '53f57c9e53a5dcb08f96b2cb',
		  customer: '53f57c9e53a5dcb08f96b2cb',
		  merchant: '53f57c9e53a5dcb08f96b2cb',
		  invoice: '53f57c9e53a5dcb08f96b2cb'
	  })
	  .expectJSONTypes('*', {
	    hkd_price: Number,
	    btc_price: Number,
	    transaction_type: String,
	    status: String,
	    merchant_wallet: Schema.ObjectId,
	    customer_wallet: Schema.ObjectId,
	    customer: Schema.ObjectId,
	    merchant: Schema.ObjectId,
	    invoice: Schema.ObjectId
	  })
	.toss();
  })
.toss();