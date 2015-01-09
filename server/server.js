'use strict';

// Requires meanio
var mean = require('meanio');
var session = require('express-session');
var logger = require('./packages/api/logging').client;
var path = require('path');
                                              
/**
* Creates and serves the app.
* Server/app configuration is happening in /config/express.js
*/
mean.serve({ /*options placeholder*/ }, function(app, config) {
	logger.info('Investor app started on port ' + config.port + ' (' + process.env.NODE_ENV + ')', ['startup']);
});
