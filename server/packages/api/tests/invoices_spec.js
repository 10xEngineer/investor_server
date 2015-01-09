'use strict';
var frisby = require('frisby');

var domain         = process.env.server || 'http://localhost:3000/',
    oauthTokenUrl  = domain + 'api/oauth/token',
    client_id      = 'UcanPayATMv1',
    client_secret  = 'abc123456',
    username       = 'stevem',
    password       = 'mypassword';

console.log('oauthTokenUrl: '+oauthTokenUrl);

frisby.create('OAuth2 login')
  .addHeader('Accept', 'application/json')
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
	
	frisby.create('Empty Invoices list')
	  .addHeader('Authorization', 'Bearer ' + requestToken)
	  .delete('http://localhost:3000/api/invoices')
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	  .expectJSONLength(0)
	  //.inspectJSON()
	.toss();

	frisby.create('Check Invoices list is empty')
	  .get('http://localhost:3000/api/invoices')
	  .addHeader('Authorization', 'Bearer ' + requestToken)
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	  .expectJSONLength(0)
	  //.inspectJSON()
	.toss();

	frisby.create('Create New Invoice')
	  .addHeader('Authorization', 'Bearer ' + requestToken)
	  .post('http://localhost:3000/api/invoices', {
	      description: 'Order #1233232',
	      items: [{
				name: 'espresso',
				quantity: 1,
				price_hkd: 50.00,
				price_btc: 0.01367
			}, {
				name: 'tiramasu',
				quantity: 1, 
				price_hkd: 100.00,
				price_btc: 0.02711
			}],
	    total_price_hkd: 150.00,
	    total_price_btc: 0.04073
	  })
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	.toss();

	frisby.create('Check Invoice is created')
	  .get('http://localhost:3000/api/invoices')
	  .addHeader('Authorization', 'Bearer ' + requestToken)
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	  .expectJSON('0', {
	      description: 'Order #1233232',
	      items: [{
				name: 'espresso',
				quantity: 1,
				price_hkd: 50.00,
				price_btc: 0.01367
			}, {
				name: 'tiramasu',
				quantity: 1,
				price_hkd: 100.00,
				price_btc: 0.02711
			}],
	      total_price_hkd: 150.00,
	      total_price_btc: 0.04073
	  })
	  .expectJSONTypes('*', {
	    description: String,
	    items: [{name: String, quantity: Number, price_hkd: Number, price_btc: Number}],
	    total_price_hkd: Number,
	    total_price_btc: Number
	  })
	.toss();
  })
.toss();