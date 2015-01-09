'use strict';

module.exports = {
    security: {
        tokenLife : 14400
    },

	mail: {
		mailchimp:  {
			api: {
				mailchimp_api_key: '80059b2bcf54f95e4498d944a2f14ea9-us9',
				mandrill_api_key: '5NVhM_oYlGCaMxZyNad1gA'
			},
			oauth: {
				client_id: '878006058838',
				client_secret: '6b954e027ef8a1efefe63d42b2020d27'
			}
		}
	},

	logging: {
		logfile: 'investor.log',
		exception_logfile: 'exception.log',
		console_level: "debug",
		file_level: "debug",
		loggly_level: "debug",
		loggly: {
			token: "ea57ea18-11ff-4634-a863-5e4d63fd19f0",
		    subdomain: "ucan.loggly.com",
			username: "velniukas",
			password: "MyP@ssword"
		}
	}
};