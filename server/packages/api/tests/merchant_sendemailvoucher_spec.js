'use strict';

var frisby = require('frisby');
var crypto = require('crypto');

frisby.globalSetup({
  timeout: 30000,
  inspectOnFailure: true
});
/**
 * Create a random hex string of specific length and
 * @todo consider taking out to a common unit testing javascript helper
 * @return string
 */
function getRandomString(len) {
  if (!len)
    len = 16;
  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex');
}

var _email = 'a.manager'+getRandomString(4)+'@merchant.com';
var _username = 'art'+getRandomString(4);
var _username1 = 'amy' + getRandomString(5);
var _phone = getRandomString(8);
var _phone1 = getRandomString(8);
var _email1 = 'amy'+getRandomString(3)+'@merchant.com';
var _customer_name = 'cust'+getRandomString(5);
var _customer_phone = getRandomString(8);
var _customer_email = 'customer'+getRandomString(3)+'@yahoo.com';
var _invoice;
var _items;

/*HACK - uncomment for oauth */
var domain         = process.env.server || 'http://localhost:3000/',
    oauthTokenUrl  = domain + 'api/oauth/token',
    client_id      = 'UcanPayATMv1',
    client_secret  = 'abc123456',
    username       = 'stevem',
    password       = 'mypassword';
    //auth           = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

frisby.create('OAuth2 login')
  //.addHeader('Accept', 'application/json')
  .addHeader('Cache-Control','no-cache')
  .post(oauthTokenUrl, {
    grant_type: 'password',
    client_id: client_id,
    client_secret: client_secret,
    username: username,
    password: password
  }, {inspectOnFailure: true})
  .inspectRequest()
  .expectStatus(200)
  .afterJSON(function(response) {
	var requestToken = response.access_token;
	var loggedInUser = response.user;
	console.log('access token: '+requestToken);
	console.log('current user: '+JSON.stringify(loggedInUser));

	frisby.create('Check Merchant is created')
	  .get(domain + 'api/merchants')
	  .addHeader('Authorization', 'Bearer ' + requestToken)
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	  .expectJSON('0', {
	      name: 'EetSumMore'
	  })
	  .expectJSONTypes('*', {
	    name: String,
	    address: String,
	    phone: String,
	    email: String,
	    logo: String
	  })
	  .afterJSON(merchant) {
			frisby.create('Create New ATM Topup Transaction')
			  .addHeader('Authorization', 'Bearer ' + requestToken)
			  .post(domain + 'api/merchants/'+a_merchant._id+'/transactions', {
			      transaction_type: 'topup',
			      hkd_price: 10,
			      btc_price: 0.0035,
				  status: 'topup',
				  //merchant_wallet_address: a_merchant.wallet._id, // will be created 
				  // HACK - hardcoded
				  customer_wallet_address: '1ALBh17JLoQxkPCS72BJgvjfLmULjuvtNL',
				  customer: {
					  username: _customer_name,
					  name: _customer_name,
				      email: _customer_email,
				      phone: _customer_phone
				  }
			  })
			  .expectStatus(200)
			  .expectHeaderContains('content-type', 'application/json')
			  //.inspectJSON()
			.toss();
			
			frisby.create('Check Transaction is created')
			  .get(domain + 'api/merchants/'+a_merchant._id+'/transactions')
			  .addHeader('Authorization', 'Bearer ' + requestToken)
			  .expectStatus(200)
			  .expectHeaderContains('content-type', 'application/json')
			  .inspectJSON()
			.toss();

	}
	.toss(); // get merchant
  })
  .toss();
