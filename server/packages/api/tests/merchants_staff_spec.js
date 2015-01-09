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
	

	frisby.create('Empty Merchants list')
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
	  .expectJSON('*', {
	      name: 'My First Merchant',
	      address: '123 Connaught Road, Hong Kong',
	      phone: '12345678',
	      email: 'first@merchant.com',
	      logo: 'http://placeholder.it/150x150'
	  })
	  .expectJSONTypes('0', {
	    name: String,
	    address: String,
	    phone: String,
	    email: String,
	    logo: String
	  })
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


	
	frisby.create('Create New Merchant Staff')
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
	
		frisby.create('Create New Staff')
	  	  .addHeader('Authorization', 'Bearer '+requestToken)
	  	  .addHeader('Accept', 'application/json')
		  .post(domain + 'api/merchants/'+merchants[0]._id+'/staff/', {
			  user: {
				username: _username,
			    password: 'Superman1',
		        name: 'Arthur Manager',
		        email: _email,
		        phone: _phone,
		        photo: 'http://placeholder.it/150x150'
			  },
		      permissions: ['merchant.manager']
		  })
		  .expectStatus(200)
		  .expectHeaderContains('content-type', 'application/json')
		  .afterJSON(function(a_merchant) {
				frisby.create('Create New Staff')
			  	  .addHeader('Authorization', 'Bearer '+requestToken)
			  	  .addHeader('Accept', 'application/json')
				  .post(domain + 'api/merchants/'+a_merchant._id+'/staff/', {
					  user: {
					  	username: _username1,
					  	password: 'helloworld',
				      	name: 'Amy Adams',
				      	email: _email1,
				      	phone: _phone1,
				      	photo: 'http://placeholder.it/150x150'
					  },
				      permissions: ['merchant.sendMoney','merchant.receiveMoney']
				  })
				  .expectStatus(200)
				  .expectHeaderContains('content-type', 'application/json')
				  .inspectJSON()
		  		  .afterJSON(function(a_merchant) {
						var a_staff = a_merchant.staff[1].user;
						console.log('Updating Staff: '+JSON.stringify(a_staff));
						frisby.create('Update Staff')
					  	  .addHeader('Authorization', 'Bearer '+requestToken)
					  	  .addHeader('Accept', 'application/json')
						  .put(domain + 'api/merchants/'+a_merchant._id+'/staff/'+a_staff._id, {
							  user: {
							  	username: _username1,
							  	password: 'hello_world',
						      	name: 'Another Adams',
						      	email: 'a_different_email_address@email.com',
						      	phone: '1111-2222',
						      	photo: 'http://placeholder.it/150x150'
							  }
						  })
						  .expectStatus(200)
						  .expectHeaderContains('content-type', 'application/json')
						  .inspectJSON()
						  .afterJSON(function(a_merchant) {
								var a_staff = a_merchant.staff[1].user;
								console.log('Removing Staff: '+JSON.stringify(a_staff));
								frisby.create('Remove Staff')
							  	  .addHeader('Authorization', 'Bearer '+requestToken)
							  	  .addHeader('Accept', 'application/json')
								  .delete(domain + 'api/merchants/'+a_merchant._id+'/staff/'+a_staff._id)
								  .expectStatus(200)
								  .expectHeaderContains('content-type', 'application/json')
								  .inspectJSON()
								  .afterJSON(function(a_merchant) {
										frisby.create('Create New Staff with missing fields')
									  	  .addHeader('Authorization', 'Bearer '+requestToken)
									  	  .addHeader('Accept', 'application/json')
										  .post(domain + 'api/merchants/'+a_merchant._id+'/staff/', {
											  user: {
											  	username: 'staff_with_missing_fields',
											  	password: 'goodbye',
										      	name: 'Martin missing',
										      	photo: 'http://placeholder.it/150x150'
											  },
										      permissions: ['merchant.receiveMoney']
										  })
										  .expectStatus(200)
										  .expectHeaderContains('content-type', 'application/json')
										  .inspectJSON()
										.toss();
									})
								.toss();
							})
						.toss();
					})
				.toss();
		  }) // afterJSON
		.toss(); // Create New Staff
		
		}) // afterJSON get merchant
	.toss(); // get merchant
  })
  .toss();
