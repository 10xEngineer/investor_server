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
	        name: '7-11 Stores Ltd',
	        address: '123 Connaught Road, Hong Kong',
	        phone: '12345678',
	        email: 'first@merchant.com',
	        logo: 'http://placeholder.it/150x150'
	    })
	  .expectStatus(200)
	  //.expectHeaderContains('content-type', 'application/json')
	  //.inspectJSON()
	.toss();
	console.log('finished creating new merchant');

    console.log('creating another new merchant');
	frisby.create('Create Second Merchant')
	  .addHeader('Authorization', 'Bearer '+requestToken)
	  .post(domain + 'api/merchants', {
	        name: 'CaliBurger',
	        address: '99 Catchick Street, Hong Kong',
	        phone: '88888888',
	        email: 'info@yummy.com',
	        logo: 'http://placeholder.it/150x150'
	    })
	  .expectStatus(200)
	  //.expectHeaderContains('content-type', 'application/json')
	  //.inspectJSON()
	.toss();
	console.log('finished creating new merchant');


    console.log('creating another new merchant');
	frisby.create('Create Third Merchant')
	  .addHeader('Authorization', 'Bearer '+requestToken)
	  .post(domain + 'api/merchants', {
	        name: 'Hot or not pot Ltd',
	        address: '101 Hollywood Road, Hong Kong',
	        phone: '88888888',
	        email: 'info@hollywood.com',
	        logo: 'http://placeholder.it/150x150'
	    })
	  .expectStatus(200)
	  //.expectHeaderContains('content-type', 'application/json')
	  //.inspectJSON()
	.toss();
	console.log('finished creating new merchant');	

    console.log('creating another new merchant');
	frisby.create('Create Fourth Merchant')
	  .addHeader('Authorization', 'Bearer '+requestToken)
	  .post(domain + 'api/merchants', {
	        name: 'EetSumMore',
	        address: '1 Omnomnom road, Hong Kong',
	        phone: '88888888',
	        email: 'info@gobble.com',
	        logo: 'http://placeholder.it/150x150'
	    })
	  .expectStatus(200)
	  //.expectHeaderContains('content-type', 'application/json')
	  //.inspectJSON()
	.toss();
	console.log('finished creating new merchant');
	
	frisby.create('Check Merchant is created')
	  .get(domain + 'api/merchants')
	  .addHeader('Authorization', 'Bearer ' + requestToken)
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	  .expectJSON('0', {
	      name: 'EetSumMore',
	      address: '1 Omnomnom road, Hong Kong',
	      phone: '88888888',
	      email: 'info@gobble.com',
	      logo: 'http://placeholder.it/150x150'
	  })
	  .expectJSONTypes('*', {
	    name: String,
	    address: String,
	    phone: String,
	    email: String,
	    logo: String
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
		var merchant = merchants[1]; // Get second merchant
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
				
				frisby.create('Create New Items')
				  .addHeader('Authorization', 'Bearer ' + requestToken)
				  .post(domain + 'api/merchants/'+a_merchant._id+'/items', {
				      items: [{
							description: 'espresso',
							quantity: 10,
							price_hkd: 50.00,
							category: 'drinks'
						}, {
							description: 'tiramasu',
							quantity: 1, 
							price_hkd: 100.00,
							category: 'desserts'
						},	{
							description: 'beer',
							quantity: 100,
							price_hkd: 60.00,
							category: 'drinks'
						}, {
							description: 'pizza',
							quantity: 10, 
							price_hkd: 200.00,
							category: 'mains'
						}
						]
				  })
				  .expectStatus(200)
				  .expectHeaderContains('content-type', 'application/json')
				  .afterJSON(function(items) {
					//console.log('items = '+JSON.stringify(items));
					_items = items; // for use below
				  })
				.toss();
				
				
				frisby.create('Create New Invoice')
				  .addHeader('Authorization', 'Bearer ' + requestToken)
				  .post(domain + 'api/merchants/'+a_merchant._id+'/invoices', {
				      description: 'Order #1233232',
					  customer: {
						  username: _customer_name,
						  name: _customer_name,
					      email: _customer_email,
					      phone: _customer_phone
					  },
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
				  .afterJSON(function(an_invoice) {
					//console.log('an_invoice = '+JSON.stringify(an_invoice));
					_invoice = an_invoice; // for use below
				  })
				.toss();

				frisby.create('Check Invoice is created')
				  .get(domain + 'api/merchants/'+a_merchant._id+'/invoices')
				  .addHeader('Authorization', 'Bearer ' + requestToken)
				  .expectStatus(200)
				  .expectHeaderContains('content-type', 'application/json')
				  .afterJSON(function(merchant) {
						//console.log('invoices[0]==' + JSON.stringify(merchant.invoices[0]));
/*									frisby.create('Create New Sale Transaction')
									  .addHeader('Authorization', 'Bearer ' + requestToken)
									  .post(domain + 'api/merchants/'+a_merchant._id+'/transactions', {
									      transaction_type: 'sale',
									      hkd_price: 10.00,
									      btc_price: 0.0030821,
										  status: 'unconfirmed',
										  //merchant_wallet_address: a_merchant.wallet._id, // will be created 
										  customer_wallet_address: '1ALBh17JLoQxkPCS72BJgvjfLmULjuvtNL',
										  customer: merchant.invoices[0].customer,
										  invoice: merchant.invoices[0]._id
									  })
									  .expectStatus(200)
									  .expectHeaderContains('content-type', 'application/json')
									  //.inspectJSON()
									.toss();
*/
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
					/*				  .expectJSON('0', {
									      transaction_type: 'sale',
									      hkd_price: 150.00,
									      btc_price: 0.04073,
										  status: 'unconfirmed',
										  merchant_wallet: a_merchant.wallet._id,
										  customer_wallet: '53f317f671324dcc43498a6a',
										  customer: '5401746425b9193245205ec7',
										  invoice: '5401904c800443ea48a6638b',
										  merchant: a_merchant._id
									  }) 
									  .expectJSONTypes('*', {

									  }) */
									.toss();
				  })
/*				  .expectJSON('0', {
				      description: 'Order #1233232',
				      merchant: a_merchant._id,
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
				  }) */
				.toss();


				
		  }) // afterJSON
		.toss(); // Create New Staff
		
		}) // afterJSON get merchant
	.toss(); // get merchant
  })
  .toss();
