var winston = require('winston');
require('winston-loggly');
var config = require('./libs/config');


var subdomain = config.logging.loggly.subdomain;
var token = config.logging.loggly.token;
var username = config.logging.loggly.username;
var password = config.logging.loggly.password;
var console_level = config.logging.console_level || "debug";
var file_level = config.logging.file_level || "debug";
var loggly_level = config.logging.loggly_level || "debug";
var logfile = config.logging.logfile || "ucanpay.log";
var exception_logfile = config.logging.exception_logfile || 'exceptions.log';

var loggly_options = {
	"inputToken": token,
	"subdomain": subdomain,
	"auth": {
		"username": username,
		"password": password
	},
	"tags": ['NodeJS', process.env.NODE_ENV || 'development'],
	"json": true,
	"level": loggly_level,
	"colorize": true
};

//winston.add(winston.transports.Console, {});
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, { 
	level : console_level, 
	colorize: true,
	prettyPrint: true, 
	handleExceptions: true,
	exitOnError: false,
	exceptionHandlers: [
		new winston.transports.File({ filename: exception_logfile })
	] 
});
winston.add(winston.transports.File, { 
	filename: logfile, 
	level: file_level, 
	colorize: true, 
	handleExceptions: true, 
	exitOnError: false,
	exceptionHandlers: [
		new winston.transports.File({ filename: exception_logfile })
	] 
});
//winston.add(winston.transports.Loggly, loggly_options);


exports.client = winston;