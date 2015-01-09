'use strict';

var frisby = require('frisby');
//var crypto = require('crypto');

/**
 * Create a random hex string of specific length and
 * @todo consider taking out to a common unit testing javascript helper
 * @return string
 */
//function getRandomString(len) {
//  if (!len)
//    len = 16;
//  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex');
//}

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
	  })
	  .expectStatus(200)
	  .afterJSON(function(response) {
		var requestToken = response.access_token;
		console.log('access token: '+requestToken);
	

		frisby.create('Empty Users list')
		  .addHeader('Authorization', 'Bearer '+requestToken)
		  .delete('http://localhost:3000/api/users')
		  .expectStatus(200)
		  .expectHeaderContains('content-type', 'application/json')
		  .expectJSONLength(0)
		  //.inspectJSON()
		.toss();

		frisby.create('Check Users list is empty')
	  	  .addHeader('Authorization', 'Bearer '+requestToken)
		  .get('http://localhost:3000/api/users')
		  .expectStatus(200)
		  .expectHeaderContains('content-type', 'application/json')
		  .expectJSONLength(0)
		  .inspectJSON()
		.toss();

		frisby.create('Create New User')
	  	  .addHeader('Authorization', 'Bearer '+requestToken)
		  .post('http://localhost:3000/api/users', {
		        firstname: 'Joe',
		        surname: 'Bloggs',
		        address: '123 Connaught Road, Hong Kong',
		        phone: '12345678',
		        email: 'first@user.com',
		        photo: 'http://placeholder.it/150x150'
		    })
		  .expectStatus(200)
		  .expectHeaderContains('content-type', 'application/json')
		.toss();

		frisby.create('Check User is created')
	  	  .addHeader('Authorization', 'Bearer '+requestToken)
		  .get('http://localhost:3000/api/users')
		  .expectStatus(200)
		  .expectHeaderContains('content-type', 'application/json')
		  .expectJSON('0', {
		      firstname: 'Joe',
		      surname: 'Bloggs',
		      address: '123 Connaught Road, Hong Kong',
		      phone: '12345678',
		      email: 'first@user.com',
		      photo: 'http://placeholder.it/150x150'
		  })
		  .expectJSONTypes('*', {
		    firstname: String,
		    surname: String,
		    address: String,
		    phone: String,
		    email: String
		  })
		.toss();
	})
.toss();