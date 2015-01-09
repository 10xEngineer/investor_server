'use strict';
var frisby = require('frisby');
var Schema = require('mongoose').Schema;
var moment = require('moment');

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
	
	frisby.create('Empty Bookings list')
	  .delete('http://localhost:3000/api/bookings')
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	  .expectJSONLength(0)
	.toss();

	frisby.create('Check bookings list is empty')
	  .get('http://localhost:3000/api/bookings')
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	  .expectJSONLength(0)
	.toss();

	frisby.create('Create New Booking')
	  .post('http://localhost:3000/api/bookings', {
	      resource: 'clinic1',
	      start_time: moment(),
	      end_time: moment().add(15, 'm'),
		  notes: 'unconfirmed',
		  contact_email: 'steve.g.messina@gmail.com'
	    })
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	.toss();

	frisby.create('Create New Booking')
	  .post('http://localhost:3000/api/bookings', {
	      resource: 'clinic1',
	      start_time: moment().add(1, 'h'),
	      end_time: moment().add(1, 'h').add(15, 'm'),
		  notes: 'unconfirmed',
		  contact_email: 'steve.g.messina@gmail.com'
	    })
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	.toss();

	frisby.create('Create New Booking')
	  .post('http://localhost:3000/api/bookings', {
	      resource: 'clinic_unused',
	      start_time: moment().add(1, 'h'),
	      end_time: moment().add(1, 'h').add(15, 'm'),
		  notes: 'confirmed but no longer used',
		  contact_email: 'steve.g.messina@gmail.com'
	    })
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	.toss();	


	frisby.create('Create New Booking - CLASH - should fail')
	  .post('http://localhost:3000/api/bookings', {
	      resource: 'clinic1',
	      start_time: moment().add(1, 'h'),
	      end_time: moment().add(1, 'h').add(15, 'm'),
		  notes: 'unconfirmed',
		  contact_email: 'steve.g.messina@gmail.com'
	    })
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	.toss();

  })
.toss();