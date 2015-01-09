'use strict';
var frisby = require('frisby');
//var crypto = require('crypto');

frisby.globalSetup({
  timeout: 30000,
  inspectOnFailure: true
});
/**
 * Create a random hex string of specific length and
 * @todo consider taking out to a common unit testing javascript helper
 * @return string
 */
/*function getRandomString(len) {
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
var _invoice; */

/*HACK - uncomment for oauth */
var domain         = process.env.server || 'http://localhost:3000/',
    oauthTokenUrl  = domain + 'api/oauth/token',
    client_id      = 'UcanPayATMv1',
    client_secret  = 'abc123456',
    username       = 'stevem',
    password       = 'mypassword';
    //auth           = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

frisby.create('OAuth2 login')
  .addHeader('Accept', 'application/json')
  .post(oauthTokenUrl, {
    grant_type: 'password',
    client_id: client_id,
    client_secret: client_secret,
    username: username,
    password: password
  }, {inspectOnFailure: true})
  .expectStatus(200)
  .afterJSON(function(response) {
	var requestToken = response.access_token;
	console.log('access token: '+requestToken);
	

	frisby.create('Empty Wallets list')
	  .addHeader('Authorization', 'Bearer '+requestToken)
	  .delete('http://localhost:3000/api/wallets')
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	  .expectJSONLength(0)
	  //.inspectJSON()
	.toss();

	frisby.create('Check Wallets list is empty')
	  .addHeader('Authorization', 'Bearer '+requestToken)
	  .get('http://localhost:3000/api/wallets')
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	  .expectJSONLength(0)
	  //.inspectJSON()
	.toss();

	frisby.create('Create New Wallet')
	  .addHeader('Authorization', 'Bearer '+requestToken)
	  .post('http://localhost:3000/api/wallets', {
	        name: 'A Merchant Ltd',
	        balance: 0.01
	    })
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	.toss();

	frisby.create('Check Wallet is created')
	  .addHeader('Authorization', 'Bearer '+requestToken)
	  .get('http://localhost:3000/api/wallets')
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	  .expectJSON('0', {
	      name: 'A Merchant Ltd',
	      balance: 0.01
	  })
	  .expectJSONTypes('*', {
	    name: String,
	    addresses: [String],
	    balance: Number
	  })
	  .inspectJSON()
	.toss();
})
.toss();