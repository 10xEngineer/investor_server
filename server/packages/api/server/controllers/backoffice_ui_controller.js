'use strict';
 
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    passport = require('passport'),
    mailchimp_controller = require('./mailchimp_controller'),
    async = require('async'),
    crypto = require('crypto'),
    config = require('../../libs/config'),
    restler = require('restler'),
    _ = require('lodash'),
    logger = require('../../logging').client,
	oauth2 = require('../../libs/oauth2'),
	_auth = require('../../libs/auth'),
	User = mongoose.model('Portfolio')
var accessToken;

mongoose.set('debug', true);

mongoose.connection.on('error', function(err) {
	logger.error('mongoose connect error: '+JSON.stringify(err));
    if (err) throw err;
});

function ajaxQuery(operator, endpoint, headers, data, remaining_attempts, callback) {
  logger.debug('executing ajax query: ('+operator+') '+endpoint+', headers: '+JSON.stringify(headers)+', data: '+JSON.stringify(data), ['ajax', 'debug']);
  var url = 'http://localhost:3000/'+endpoint;
  switch( operator ) {
	case 'GET':
		restler.get(url, { 
		  headers: headers,
		  data: data
		})
	  .on('error', function(err, response) {
		logger.error('ajax GET error: '+JSON.stringify(err));
		callback(err, response);
	  })
	  .on("complete", function(response) {
	    logger.debug('ajax GET received; ' + JSON.stringify(response), ['ajax', 'debug']);
		// If we have exceeded the rate limit (but not because of too much money spent, just # requests per sec, then try again after delay)
	    if( response.status == '429' && ! response.so_far ) {
			if( remaining_attempts == 0 ) {
				callback({error: 'exceed ajax retries', response: response});
			} else {
				logger.info('Retrying ajax query: ('+remaining_attempts+'), after: '+response.wait_time+' sec');
				setTimeout(function() {
					ajaxQuery(operator, endpoint, headers, data, remaining_attempts-1, callback)
				},  ( response.wait_time || 2 )* 1000);
			}
		} else {
			if( response.status && response.status != '200' ) {
				logger.error('ajax: '+JSON.stringify(response));
				callback(response, null);
			} else {
				logger.debug('ajax: returning result: '+JSON.stringify(response));
		    	callback(null, response);
			}
		}
	  });
	  break;
	
	case 'PUT':
		restler.put(url, { 
		  headers: headers,
		  data: data
		})
	  .on('error', function(err, response) {
		logger.error('ajax PUT error: '+JSON.stringify(err));
		callback(err, response);
	  })
	  .on("complete", function(response) {
	    logger.debug('ajax PUT received; ' + JSON.stringify(response), ['ajax', 'debug']);
		// If we have exceeded the rate limit (but not because of too much money spent, just # requests per sec, then try again after delay)
	    if( response.status == '429' && ! response.so_far ) {
			if( remaining_attempts == 0 ) {
				callback({error: 'exceed ajax retries', response: response});
			} else {
				logger.info('Retrying ajax query: ('+remaining_attempts+'), after: '+response.wait_time+' sec');
				setTimeout(function() {
					ajaxQuery(operator, endpoint, headers, data, remaining_attempts-1, callback)
				}, (response.wait_time || 2) * 1000);
			}
		} else {
			if( response.status && response.status != '200' ) {
				logger.error('ajax: '+JSON.stringify(response));
				callback(response, null);
			} else {
				logger.debug('ajax: returning result: '+JSON.stringify(response));
	    		callback(null, response);
			}
		}
	  });
	  break;
	
	case 'POST':
		restler.post(url, { 
		  headers: headers,
		  data: data
		})
	  .on('error', function(err, response) {
		logger.error('ajax POST error: '+JSON.stringify(err));
		callback(err, response);
	  })
	  .on("complete", function(response) {
	    logger.debug('ajax POST received; ' + JSON.stringify(response), ['ajax', 'debug']);
		// If we have exceeded the rate limit (but not because of too much money spent, just # requests per sec, then try again after delay)
	    if( response.status == '429' && ! response.so_far ) {
			if( remaining_attempts == 0 ) {
				callback({error: 'exceed ajax retries', response: response});
			} else {
				logger.info('Retrying ajax query: ('+remaining_attempts+'), after: '+response.wait_time+' sec');
				setTimeout(function() {
					ajaxQuery(operator, endpoint, headers, data, remaining_attempts-1, callback)
				}, (response.wait_time || 2) * 1000);
			}
		} else {
			if( response.status && response.status != '200' ) {
				logger.error('ajax: '+JSON.stringify(response));
				callback(response, null);
			} else {
				logger.debug('ajax: returning result: '+JSON.stringify(response));
	    		callback(null, response);
			}
		}
	  });
	  break;
	
	case 'DEL':
		restler.del(url, { 
		  headers: headers })
		  .on('error', function(err, response) {
			logger.error('ajax DEL error: '+JSON.stringify(err));
			callback(err, response);
		  })
		  .on("complete", function(response) {
		    logger.debug('ajax DEL received; ' + JSON.stringify(response), ['ajax', 'debug']);
			// If we have exceeded the rate limit (but not because of too much money spent, just # requests per sec, then try again after delay)
		    if( response.status == '429' && ! response.so_far ) {
				if( remaining_attempts == 0 ) {
					callback({error: 'exceed ajax retries', response: response});
				} else {
					logger.info('Retrying ajax query: ('+remaining_attempts+'), after: '+response.wait_time+' sec');
					setTimeout(function() {
						ajaxQuery(operator, endpoint, headers, data, remaining_attempts-1, callback)
					}, (response.wait_time || 2) * 1000);
				}
			} else {
				if( response.status && response.status != '200' ) {
					logger.error('ajax: '+JSON.stringify(response));
					callback(response, null);
				} else {
					logger.debug('ajax: returning result: '+JSON.stringify(response));
		    		callback(null, response);
				}
			}
		  });
	  break;
	  default:
		callback({error: 'Invalid Operator: '+operator}, null);
	}

};

exports.website_signup = function(req, res) {
	res.render('website/signup.html', {

	});
}

exports.mailinglist_signup = function(req, res) {
	logger.info('mailing list signup.');
	var _email = req.body && req.body.email || req.params && req.params.email;
	logger.info(_email + " signed up.");
	
	  if( _email && _email != '' ) {
			mailchimp_controller.sendTemplateEmail( 'Subscription Confirmation', 
													_email, 
													'UCanPay mailing list signup', 
													'', 
													[{
														email: _email
													}], 
													function(err, result) {
													    if (err) {
														    logger.error('email send error: '+JSON.stringify(err));
													    };
												        logger.info('A receipt e-mail has been sent to ' + _email + ' with further confirmation.');
			});	

	  } else {
		  logger.error('user has no email to send reset to');
	  }
	
	res.render('../../public/assets/static/website/home.html', {
		user: req.user,
		message: 'Thank you for Signing up to our service.'
	});
}

exports.home_page = function(req, res){
  async.waterfall([
    function(done) {
		if (req.user && req.user.userType == 'staff' && !req.merchants) {
			// get the merchant if the user is staff
			logger.info('finding merchant: '+JSON.stringify(req.user.merchant));
			
			Merchant.findById(req.user.merchant).populate('wallet staff.user transactions').exec(function (err, merchant) {
				if (err) logger.error('found merchant error: '+JSON.stringify(err));
				logger.info('found merchant: '+JSON.stringify(merchant));
				done(err, merchant);
			});
		} else { 
			if (req.user && req.user.userType == 'admin' && !req.merchants) {
				// get the merchant if the user is staff
				logger.info('Getting all merchants');
				Merchant.find().populate('wallet staff.user transactions').exec(function (err, merchants) {
					if (err) logger.error('found merchants error: '+JSON.stringify(err));
					logger.info('found merchants: '+JSON.stringify(merchants));
					done(err, merchants);
				});
			} else {
				done(null, req.merchants);
			}
		}
	},
	function(merchants, done) {
	  if (req.user && req.user.userType == 'admin') {
		  res.render('backoffice/merchant_list.html', {
		    title: 'UCanPay Back Office : Admin',
		    user: req.user,
			merchants: merchants
		  });
	  } else if (req.user && req.user.userType == 'staff'){
		  res.render('backoffice/merchant_profile.html', {
		    title: 'UCanPay Merchant Administration',
		    user: req.user,
			merchant: merchants
		  });
	  } else {
		  res.render('backoffice/index.html', {
		    title: 'UCanPay Administration',
		    user: req.user
		  });
	  }
	}]);
};

exports.merchant_profile_page = function(req, res) {
  res.render('backoffice/merchant_profile.html', {
    user: req.user,
    merchant: req.merchant
  });
};

exports.user_profile_page = function(req, res) {
  res.render('backoffice/user_profile.html', {
    user: req.user
  });
};


exports.admin_home_page = function(req, res) {
	MerchantRegistration.find().populate('staff').exec(function (err, merchants) {
		if (err) logger.error('found registrations error: '+JSON.stringify(err));
		logger.info('found registrations: '+JSON.stringify(merchants));
		res.render('backoffice/admin.html', {
	    	user: req.user,
			merchants: merchants
	    });
	});
};

exports.login_page = function(req, res) {
  res.render('backoffice/login.html', {
    user: req.user
  });
};

exports.login = function(req, res, next) {
  logger.info('login');
  logger.info('login params: '+JSON.stringify(req.params));
  passport.authenticate('local', function(err, user, info) {
    if (err) {
		logger.error('Login authenticate error: '+JSON.stringify(err));
		return next(err);
	};
    if (!user) {
	  logger.error('Login error (user not found): '+JSON.stringify(err));
      return res.redirect('/office/login')
    }
    req.logIn(user, function(err) {
      if (err) {
	    logger.error('Login error:'+JSON.stringify(err));
	  	return next(err);
	  }
	  logger.info('Login success.');
	  accessToken = null;
	  ajaxQuery('POST',
				'api/oauth/token', 
				{ 'Cache-Control': 'no-cache'}, 
				{
				    grant_type: 'password',
				    client_id: 'UcanPayWebATMv1',
				    client_secret: 'alongssecretphrase',
				    username: user.username,
				    password: req.body.password 
				},
				3,
			function(err, result) {
				if(err)  {logger.error('oauth token error: '+JSON.stringify(err)); }
				else {
					accessToken = result.access_token;
					logger.info('oauth token: '+accessToken);
				}
				return res.redirect('/office/');
			}
		);
    });
  })(req, res, next);
};

exports.signup_page = function(req, res) {
  res.render('backoffice/signup', {
    user: req.user
  });
};

exports.signup = function(req, res) {
  logger.info('signup');
  var user = new User({
      username: req.body && req.body.username || req.params && req.params.username,
      name: req.body && req.body.name || req.params && req.params.name,
      email: req.body && req.body.email || req.params && req.params.email,
      phone: req.body && req.body.phone || req.params && req.params.phone,
      password: req.body && req.body.password || req.params && req.params.password,
      userType: 'admin'
    });

  user.save(function(err) {
    req.logIn(user, function(err) {
      res.redirect('/office/');
    });
  });
};

exports.registration_page = function(req, res) {
  res.render('../../public/assets/static/website/signup.html', { // previously 'backoffice/merchant_registration'
    user: req.user
  });
};

exports.registration = function(req, res) {
  var name = req.body && req.body['business-name'] || req.params && req.params['business-name'];
  //MerchantRegistration.find().populate('staff').exec(function (err, merchants) {
  Merchant.findOne({name: name}).exec( function(err, merchant) {
	  if( merchant ) {
		logger.info('Merchant already registered and created: '+JSON.stringify(merchant));
		res.status(200).end();
	  } else {
		  logger.info('registration');
		  //var merchant = new Merchant({
			//name: req
		  //});
		  var user = new User({
		      username: req.body && req.body.email || req.params && req.params.email,
		      name: req.body && req.body.name || req.params && req.params.name,
		      email: req.body && req.body.email || req.params && req.params.email,
		      phone: req.body && req.body.phone || req.params && req.params.phone,
		      password: req.body && req.body.password || req.params && req.params.password,
		      permissions: ['merchant.manager','merchant.sendMoney','merchant.receiveMoney'],
		      userType: 'staff'
		    });
		  logger.info('registered user: '+JSON.stringify(user));
		  user.save(function(err) {
			// now handle the merchant registration creation
			//Merchants.find({name: "req.params"})
			merchants_controller.createWallet({
			    description: req.body && req.body.description || req.params && req.params.description,
			    name: req.body && req.body['business-name'] || req.params && req.params['business-name'],
			    email: req.body && req.body.email || req.params && req.params.email,
			    phone: req.body && req.body.phone || req.params && req.params.phone,
			    address: req.body && req.body.address || req.params && req.params.address,
			    style: req.body && req.body.style || req.params && req.params.style || '',
			    tags: req.body && req.body.tags || req.params && req.params.tags || ''
			}, function(err, merchant) {
				merchant.staff = [user._id];
				logger.info('registered merchant: '+JSON.stringify(merchant));

				merchant.save(function(err) {
					if (err) {
						logger.error('Merchant Registration Save Error: '+JSON.stringify(err));
					} else {
						mailchimp_controller.sendTemplateEmail( 'Registration Confirmation', 
																'steve.g.messina@gmail.com', //req.body && req.body.email || req.params && req.params.email, 
																'Thank you for registering for the UCanPay Beta', 
																'', 
																[
																	// User / Staff
																	{name: 'username', content: req.body && req.body.email || req.params && req.params.email},
															      	{name: 'name', content: req.body && req.body.name || req.params && req.params.name},
															      	{name: 'email', content: req.body && req.body.email || req.params && req.params.email},
															      	{name: 'phone', content: req.body && req.body.phone || req.params && req.params.phone},
																	// Business
																	{name: 'description', content: req.body && req.body.description || req.params && req.params.description},
															      	{name: 'business_name', content: req.body && req.body['business-name'] || req.params && req.params['business-name']},
															      	{name: 'business_email', content: req.body && req.body.email || req.params && req.params.email},
															      	{name: 'business_phone', content: req.body && req.body.phone || req.params && req.params.phone},
															      	{name: 'address', content: req.body && req.body.address || req.params && req.params.address},
															      	{name: 'style', content: req.body && req.body.style || req.params && req.params.style || ''}
																], 
																function(err, result) {
																    if (err) {
																	    logger.error('email send error: '+JSON.stringify(err));
																    };
															        //req.flash('info', 'A receipt e-mail has been sent to ' + user.email + ' with confirmation.');
															        logger.info('A registration receipt e-mail has been sent to ' + req.body && req.body.email || req.params && req.params.email + ' with further instructions for the beta signup.');
						});
						res.redirect('/office/registration_confirmation', {
							user: req.user,
							merchant: merchant
						})
					}
				});

			});
			//});
		  });

	  };

  });
};

exports.registration_confirmation_page = function(req, res) {
  res.render('backoffice/registration_confirmation.html', {
    user: req.user,
    merchant: req.merchant
  });
};


exports.logout = function(req, res) {
  logger.info('logout');
  req.logout();
  res.redirect('/office/');
};

exports.forgot_page = function(req, res) {
  res.render('backoffice/forgot.html', {
    user: req.user
  });
};

exports.forgot_confirmation_page = function(req, res) {
  res.render('backoffice/forgot_confirmation.html', {
    user: req.user,
    email: req.email,
    phone: req.phone
  });
};

exports.forgot = function(req, res) {
  logger.info('forgot');
	var email = req.body && req.body.email || req.params && req.params.email;
	var phone = req.body && req.body.phone || req.params && req.params.phone;
	if ( !email && !phone ) {
		logger.error('A notification preference is needed that is valid. (email or phone): \nsubmitted email: '+user.email+'\nphone: '+user.phone);
		return next({err: 'A notification preference is needed that is valid. (email or phone): \nsubmitted email: '+user.email+'\nphone: '+user.phone});
	};
  async.waterfall([
    function(callback) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        callback(err, token);
      });
    },
    function(token, callback) {
	  var search = '';
	  if ( email ) 
		search = { email: email } 
	  else 
		search = { phone: phone };
	  
	  logger.info('forgot search term: '+JSON.stringify(search));
      User.findOne(search, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address or phone exists.');
          logger.error('No account with this email address or phone exists.');
          return res.redirect('/office/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
	      logger.debug('user reset tokens set');
          callback(err, token, user);
        });
      });
    },
    function(token, user, callback) {
	  if( email && email != '' || user.email && user.email != '' ) {
/*	      var smtpTransport = nodemailer.createTransport("SMTP", {
	          service: 'Gmail',
	          auth: {
	              XOAuth2: {
	                  user: config.mail.google.email,
	                  clientId: config.mail.google.api.client_id,
	                  clientSecret: config.mail.google.api.client_secret,
	                  refreshToken: config.mail.google.api.refresh_token,
	              }
	          }
	      });
	      var mailOptions = {
	        to: email,
	        from: 'donotreply@ucanpay.io',
	        subject: 'UCanPay Password Reset',
	        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
	          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
	          'http://' + req.headers.host + '/office/reset/' + token + '\n\n' +
	          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
	      };
	      smtpTransport.sendMail(mailOptions, function(err) {
		    if (err) {
			    logger.error('email send error: '+JSON.stringify(err));
			    callback(err, token, user);
		    };
	        req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
	        logger.info('An e-mail has been sent to ' + user.email + ' with further instructions.');
	        callback(err, token, user);
	      }); */
			var reset_url = 'http://' + req.headers.host + '/office/reset/' + token;
			logger.debug('reset url: ('+email+') '+reset_url);
			mailchimp_controller.sendTemplateEmail( 'Password Reset', 
													email, 
													'UCanPay Password Reset', 
													'',
													[{name: "email", content: email}, {name: "RESETLINK", content: reset_url}], 
													function(err, result) {
													    if (err) {
														    logger.error('email send error: '+JSON.stringify(err));
													    };
												        //req.flash('info', 'A receipt e-mail has been sent to ' + user.email + ' with confirmation.');
												        logger.info('A password reset e-mail has been sent to ' + email + ' with further instructions.');
			});
			callback(null, token, user);
	  } else {
		  logger.error('user has no email to send reset to');
		  callback({errors: {error: 'User has no email to send a reset to.'}}, token, user);
	  }

	},
	function(token, user, callback) {
		if( phone && phone != '' || user.phone && user.phone != '' ) { // send by phone
			var message = 'UCanPay password reset:\n\n' +
	          'http://' + req.headers.host + '/office/reset/' + token + '\n\n'; // +
	          //'If you did not request this, please ignore this message and your password will remain unchanged.\n';
			SMSController.sendSMS(user.phone, message, function(err, result) {
			    if (err) {
			        logger.error('password reset sms error: '+JSON.stringify(err, null, 3),['password','error','sms']);
					callback(err, null);
			    }
			    else {
			        logger.debug('password reset sent to SMS '+user.phone);
			        logger.debug(JSON.stringify(result, null, 3));
					callback(err, 'done');
			    }
			});
		} else {
		  logger.error('user has no phone to send reset to');
		  callback(err, null);
		}
    }
  ], function(err, result) {
    if (err) {
	    logger.error('error: during reset pwd: '+JSON.stringify(err));
	    res.status(500).json(err);
	};
    res.render('backoffice/forgot_confirmation', {
		user: req.user,
		email: req.body.email || req.user.email && req.user.email,
		phone: req.body.phone || req.user && req.user.phone 
	});
  });
};

exports.reset_page = function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      logger.error('Password reset token is invalid or has expired.');
      return res.redirect('/office/forgot_confirmation');
    }
    res.render('backoffice/reset', {
      user: req.user
    });
  });
};

exports.reset = function(req, res) {
  logger.info('reset');
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          logger.error('Password reset token is invalid or has expired.');
          return res.redirect('back');
        }

        user.password = req.body && req.body.password || req.params && req.params.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          });
        });
      });
    },
    function(user, done) {
	  if( user.email && user.email != '' ) {
/*	      var smtpTransport = nodemailer.createTransport("SMTP", {
	          service: 'Gmail',
	          auth: {
	              XOAuth2: {
	                  user: config.mail.google.email,
	                  clientId: config.mail.google.api.client_id,
	                  clientSecret: config.mail.google.api.client_secret,
	                  refreshToken: config.mail.google.api.refresh_token,
	              }
	          }
	      });
	      var mailOptions = {
	        to: user.email,
	        from: 'passwordreset@ucanpay.io',
	        subject: 'Your UCanPay password has been changed',
	        text: 'Hello,\n\n' +
	          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
	      };
	      smtpTransport.sendMail(mailOptions, function(err) {
	        req.flash('success', 'Success! Your password has been changed.');
	        logger.info('Success! Your password has been changed.');
	        done(err, user);
	      }); */
			mailchimp_controller.sendTemplateEmail( 'Password Reset Confirmation', 
													user.email, 
													'UCanPay Password Reset Confirmation', 
													'', 
													[{
														name: 'email', content: user.email
													}], 
													function(err, result) {
													    if (err) {
														    logger.error('email send error: '+JSON.stringify(err));
													    };
												        //req.flash('info', 'A receipt e-mail has been sent to ' + user.email + ' with confirmation.');
												        logger.info('A password reset confirmation e-mail has been sent to ' + user.email + '.');
			});
			done(null, user);
		}
    },
    function(user, done) {
		if( user.phone && user.phone != '' ) { // send by phone
			var message = 'Hello,\n\n' +
	          'This is a confirmation that the password for your UCanPay account ' + user.phone + ' has just been changed.';
			SMSController.sendSMS(user.phone, message, function(err, result) {
			    if (err) {
			        logger.error('password reset confirmation error: '+JSON.stringify(err, null, 3),['password','error','sms']);
					done(err, null);
			    }
			    else {
			        logger.debug('password reset confirmation sent to SMS '+user.phone);
			        logger.debug(JSON.stringify(result, null, 3));
					done(null, user);
			    }
			});
		}
    }
  ], function(err, result) {
	if(err) {
		logger.error('error during pwd reset: '+JSON.stringify(err)+', result: '+JSON.stringify(err));
	};

    res.render('backoffice/password_reset_confirmed', {user: req.user, email: req.user.email});
  });
};

exports.map_page = function(req, res) {
	Merchant.find().populate('wallet staff.user transactions').exec(function (err, merchants) {
		if (err) logger.error('found merchants error: '+JSON.stringify(err));
		logger.info('loaded map merchants: '+JSON.stringify(merchants));
		res.render('backoffice/map', {
			user: req.user,
			merchants: merchants
		});
	});
};

exports.drop_pin = function(req, res) {
	var location = req.body && req.body.location || req.params && req.params.location;
	logger.debug('requested dropping pin ('+merchantId+') at: '+JSON.stringify(location));
	Merchant.find({_id: merchantId}, function(err, merchant) {
		logger.info('dropping pin: name="'+merchant.name+'", location = ['+JSON.stringify(location)+']');
		merchant.geoJSON = location;
		merchant.save(function(err) {
			if(err) {
				logger.error('Error while saving merchant location: '+JSON.stringify(err));
				res.status(500).json(err);
			} else {
				logger.debug('Merchant location saved: '+JSON.stringify(merchant.geoJSON));
				// now update the map
				res.status(200).json(merchant);
			};
		})
	});
};

exports.menu_page = function(req, res) {
	Merchant.findById("5444b5f143e6ab7c300b742d").populate('items').exec(function (err, merchants) {
		if (err) logger.error('found merchants error: '+JSON.stringify(err));
		logger.info('loaded menu merchants: '+JSON.stringify(merchants));
		res.render('backoffice/menu', {
			user: req.user,
			merchants: merchants
		});
	});
};
