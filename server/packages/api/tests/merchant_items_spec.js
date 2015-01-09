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
	
	frisby.create('Check Merchant is created')
	  .get(domain + 'api/merchants')
	  .addHeader('Authorization', 'Bearer ' + requestToken)
	  .expectStatus(200)
	  .expectHeaderContains('content-type', 'application/json')
	  .afterJSON(function(merchants) {
		a_merchant = merchants[0];
		console.log('merchant.id == '+a_merchant._id+', '+a_merchant.name);
		frisby.create('Delete all items')
		  .delete(domain + 'api/merchants/'+a_merchant._id+'/items')
		  .addHeader('Authorization', 'Bearer ' + requestToken)
		  .expectStatus(200)
		  .expectHeaderContains('content-type', 'application/json')
		  .inspectJSON()
		  .afterJSON(function() {
			console.log('working with merchant: '+JSON.stringify(a_merchant));
			frisby.create('Create New Items')
			  .addHeader('Authorization', 'Bearer ' + requestToken)
			  .post(domain + 'api/merchants/'+a_merchant._id+'/items', {
				items: [{
						description: "Breakfast Salmon Bagel",
						quantity: 10,
						price_hkd: 110.00,
						category: "breakfast",
						photo: "foodpics/breakfast salmon bagel.jpeg"
					}, {
						description: "Bruschetta",
						quantity: 1, 
						price_hkd: 80.00,
						category: "starter",
						photo: "foodpics/bruschetta.jpeg"
					},	{
						description: "Burger Bagel",
						quantity: 10,
						price_hkd: 160.00,
						category: "main",
						photo: "foodpics/burger bagel.jpeg"
					}, {
						description: "Calamari Salad",
						quantity: 10, 
						price_hkd: 200.00,
						category: "starter",
						photo: "foodpics/calamari salad.jpeg"
					}, {
						description: "Chicken Wings",
						quantity: 10,
						price_hkd: 100.00,
						category: "starter",
						photo: "foodpics/chicken wings.jpeg"
					}, {
						description: "Chocolate Dessert",
						quantity: 1, 
						price_hkd: 80.00,
						category: "dessert",
						photo: "foodpics/chocolate dessert.jpeg"
					},	{
						description: "Classic Beef Burger",
						quantity: 10,
						price_hkd: 160.00,
						category: "main",
						photo: "foodpics/classic burger.jpeg"
					}, {
						description: "Classic Pizza",
						quantity: 10, 
						price_hkd: 140.00,
						category: "main",
						photo: "foodpics/classic pizza.jpeg"
					}, {
						description: "Greek Pasta",
						quantity: 10,
						price_hkd: 110.00,
						category: "starter",
						photo: "foodpics/greek pasta.jpeg"
					}, {
						description: "Lamb",
						quantity: 1, 
						price_hkd: 180.00,
						category: "main",
						photo: "foodpics/lamb.jpeg"
					},	{
						description: "Mexican Chili Beef Wrap",
						quantity: 10,
						price_hkd: 160.00,
						category: "main",
						photo: "foodpics/mexican beef wrap.jpeg"
					}, {
						description: "Mozarella Tomato Salad",
						quantity: 10, 
						price_hkd: 100.00,
						category: "starter",
						photo: "foodpics/mozarella tomato salad.jpeg"
					}, {
						description: "Olives",
						quantity: 10,
						price_hkd: 60.00,
						category: "starter",
						photo: "foodpics/olives.jpeg"
					}, {
						description: "Pancakes in Maple Syrup",
						quantity: 1, 
						price_hkd: 180.00,
						category: "dessert",
						photo: "foodpics/pancakes.jpeg"
					},	{
						description: "King Prawn Salad",
						quantity: 10,
						price_hkd: 160.00,
						category: "starter",
						photo: "foodpics/prawn salad.jpeg"
					}, {
						description: "Beef Ribs in BBQ Sauce",
						quantity: 10, 
						price_hkd: 200.00,
						category: "main",
						photo: "foodpics/ribs.jpeg"
					}, {
						description: "Whole Roast Chicken",
						quantity: 10,
						price_hkd: 250.00,
						category: "main",
						photo: "foodpics/roast chicken.jpeg"
					}, {
						description: "Salmon",
						quantity: 1, 
						price_hkd: 280.00,
						category: "main",
						photo: "foodpics/salmon.jpeg"
					},	{
						description: "Tenderloin Steak",
						quantity: 10,
						price_hkd: 360.00,
						category: "main",
						photo: "foodpics/steak.jpeg"
					}, {
						description: "Sushi Selection",
						quantity: 10, 
						price_hkd: 400.00,
						category: "starter",
						photo: "foodpics/sushi.jpeg"
					}, {
						description: "Tuna Taglietella Salad",
						quantity: 1,
						price_hkd: 180,
						category: "starter",
						photo: "foodpics/tuna taglietella salad.jpeg"
					}
				]
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
