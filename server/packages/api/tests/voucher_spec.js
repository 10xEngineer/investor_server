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

/*HACK - uncomment for oauth */
var domain         = process.env.server || 'http://localhost:3000/',
    oauthTokenUrl  = domain + 'api/oauth/token',
    client_id      = 'UcanPayATMv1',
    client_secret  = 'abc123456',
    username       = 'stevem',
    password       = 'mypassword',
    a_merchant     = null;
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
	console.log('access token: '+requestToken);
	
/*	frisby.create('Empty Merchants list')
	  .addHeader('Authorization', 'Bearer '+requestToken)
	  .addHeader('Accept', 'application/json')
	  .delete(domain + 'api/merchants')
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	  .expectJSONLength(0)
	.toss();

	frisby.create('Check Merchants list is empty')
	  .addHeader('Authorization', 'Bearer '+requestToken)
	  .get(domain + 'api/merchants')

	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	  .expectJSONLength(0)
	  //.inspectJSON()
	.toss();

    console.log('creating new merchant');
	frisby.create('Create New Merchant')
	  .addHeader('Authorization', 'Bearer '+requestToken)
	  .post(domain + 'api/merchants', {
	        name: 'My First Merchant',
	        address: '123 Connaught Road, Hong Kong',
	        phone: '12345678',
	        email: 'first@merchant.com',
	        logo: 'http://placeholder.it/150x150'
	    })
	  .expectStatus(200)
	  .afterJSON(function(merchant) {
		a_merchant = merchant;
	  })
	  //.expectHeaderContains('content-type', 'application/json')
	  //.inspectJSON()
	.toss();
	console.log('finished creating new merchant');

	frisby.create('Check Merchant is created')
	  .get(domain + 'api/merchants')
	  .addHeader('Authorization', 'Bearer ' + requestToken)
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	  .afterJSON(function(merchants) {
		console.log('merchant.id == '+merchants[0]._id);
		frisby.create('Delete all staff users')
		  .delete(domain + 'api/merchants/'+merchants[0]._id+'/staff')
		  .addHeader('Authorization', 'Bearer ' + requestToken)
		  .expectStatus(200)
		  .expectHeaderContains('content-type', 'application/json')
		  .inspectJSON()
		.toss();
	  })
	.toss();
*/

	
	frisby.create('Get first merchant')
	  .get(domain + 'api/merchants')
	  .addHeader('Authorization', 'Bearer '+requestToken)
	  .addHeader('Accept', 'application/json')
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	  .inspectJSON()
	  .afterJSON(function(merchants) {
		expect(merchants.length).toBeGreaterThan(0);
		var merchant = merchants[0]; // Get first merchant
		console.log(JSON.stringify('merchant = '+merchant));
	
		frisby.create('Create an Email Voucher')
	  	  .addHeader('Authorization', 'Bearer '+requestToken)
	  	  .addHeader('Accept', 'application/json')
		  .post(domain + 'api/merchants/'+merchants[0]._id+'/createEmailVoucher', {
			email: 'steve.g.messina@gmail.com',
			btc_amount: 0.0003
		  })
		  .expectStatus(200)
		  .expectHeaderContains('content-type', 'application/json')
		.toss(); // Create Email Voucher
		
		frisby.create('Create an SMS Voucher')
	  	  .addHeader('Authorization', 'Bearer '+requestToken)
	  	  .addHeader('Accept', 'application/json')
		  .post(domain + 'api/merchants/'+merchants[0]._id+'/createSMSVoucher', {
			phone: '+85263908102',
			btc_amount: 0.0003
		  })
		  .expectStatus(200)
		  .expectHeaderContains('content-type', 'application/json')
		.toss(); // Create SMS Voucher
		
		}) // afterJSON get merchant
	.toss(); // get merchant
  })
  .toss();
