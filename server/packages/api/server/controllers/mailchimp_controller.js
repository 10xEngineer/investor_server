'use strict';

var config = require('../../libs/config');
var mandrill = require('mandrill-api/mandrill');

var key = config.mail.mailchimp.api.mandrill_api_key;
var secret = config.mail.mailchimp.api.api_secret;
var logger = require('../../logging').client;

// Create a new REST API client to make authenticated requests against the
// mailchimp / mandrill back end
var client = new mandrill.Mandrill(key);
logger.info('Mailchimp key: '+key);

var email_logger = new (logger.Logger)({ handleExceptions: true, exitOnError: false });
email_logger.on('error', function (err) {
	console.log('Sending API ERROR email.');
	fs.readFile(logfile, function(err, logfile){
	    var logfile_base64 = logfile.toString('base64');
		sendTemplateEmail( 'API Server Error', 
							'bugs@ucanpay.io', 
							'API Server Error report', 
							'', 
							{
								error: err,
								datetime: Date.now()
							},
							[{
						            "type": "text/plain",
						            "name": logfile,
						            "content": logfile_base64
						    }],
							function(err, result) {
							    if (err) {
								    console.log('logger.onerror email send error: '+JSON.stringify(err));
							    };
		});
	});
});

/*{
    "key": "example key",
    "template_name": "example template_name",
    "template_content": [
        {
            "name": "example name",
            "content": "example content"
        }
    ],
    "message": {
        "html": "<p>Example HTML content</p>",
        "text": "Example text content",
        "subject": "example subject",
        "from_email": "message.from_email@example.com",
        "from_name": "Example Name",
        "to": [
            {
                "email": "recipient.email@example.com",
                "name": "Recipient Name",
                "type": "to"
            }
        ],
        "headers": {
            "Reply-To": "message.reply@example.com"
        },
        "important": false,
        "track_opens": null,
        "track_clicks": null,
        "auto_text": null,
        "auto_html": null,
        "inline_css": null,
        "url_strip_qs": null,
        "preserve_recipients": null,
        "view_content_link": null,
        "bcc_address": "message.bcc_address@example.com",
        "tracking_domain": null,
        "signing_domain": null,
        "return_path_domain": null,
        "merge": true,
        "merge_language": "mailchimp",
        "global_merge_vars": [
            {
                "name": "merge1",
                "content": "merge1 content"
            }
        ],
        "merge_vars": [
            {
                "rcpt": "recipient.email@example.com",
                "vars": [
                    {
                        "name": "merge2",
                        "content": "merge2 content"
                    }
                ]
            }
        ],
        "tags": [
            "password-resets"
        ],
        "subaccount": "customer-123",
        "google_analytics_domains": [
            "example.com"
        ],
        "google_analytics_campaign": "message.from_email@example.com",
        "metadata": {
            "website": "www.example.com"
        },
        "recipient_metadata": [
            {
                "rcpt": "recipient.email@example.com",
                "values": {
                    "user_id": 123456
                }
            }
        ],
        "attachments": [
            {
                "type": "text/plain",
                "name": "myfile.txt",
                "content": "ZXhhbXBsZSBmaWxl"
            }
        ],
        "images": [
            {
                "type": "image/png",
                "name": "IMAGECID",
                "content": "ZXhhbXBsZSBmaWxl"
            }
        ]
    },
    "async": false,
    "ip_pool": "Main Pool",
    "send_at": "example send_at"
}*/
function sendTemplateEmail(template, email, subject, text, content, callback) {
	// Pass in parameters to the REST API using an object literal notation. The
	// REST client will handle authentication and response serialzation for you.
	// string key, string template_name, array template_content, struct message, boolean async, string ip_pool, string send_at

	var params = {
		"template_name": template,
		"template_content": content,

		//"merge_vars": [{
		//	rcpt: email,
		//	vars: text
		//}],
		"message": {
	    	"from_email":"donotreply@ucanpay.io",
	    	"to":[{"email":email}],
	    	"subject": subject,
			"global_merge_vars": content
//	    	"text": text
		},
		
		track_open: true,
		track_clicks: true,
		merge: true,
	    merge_language: "mailchimp",
	};
	logger.info(JSON.stringify(params));
	client.messages.sendTemplate(params, function(res) {
        logger.info('Success! Sent templated email:');
		callback(null, 'Success: email sent: ('+template+'):'+subject+' -> '+email);
	}, function(error) {
		logger.error('sendTemplateEmail: There was an error:'+JSON.stringify(error));
		callback({errors: {error: error}}, null);
	});
}

exports.sendTemplateEmail = function(template, email, subject, text, content, callback) {
	if ( !template || !email ) {
		callback({error: 'sendTemplateEmail: invalid email or template ('+email+') '+JSON.stringify(message)}, null);
	} else {
		sendTemplateEmail( template, email, subject, text, content, function( err, result ) {
			if (err) {
				callback({errors: {error:'sendTemplateEmail: error while sending ('+email+') '+JSON.stringify(err)}}, null);
			} else {
				callback(null, result);
			}
		})
	}
};

