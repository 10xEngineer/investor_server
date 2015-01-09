var socketio = require('socket.io'),
    cookieParser = require('cookie-parser'),
    apiConfig = require('../packages/api/libs/config')
    AccessTokenModel = require('../packages/api/server/models/token.js').AccessTokenModel,
    UserModel = require('../packages/api/server/models/user.js').UserModel;

module.exports = function(mean) {
	var config = mean.loadConfig();
	
	io = socketio(3001);

	io.use(function ioSession(socket, next) {
		// create the fake req that cookieParser will expect                          
		var req = {
				headers: {
					cookie: socket.request.headers.cookie,
				},
			}
			authCookie = null
		;

		cookieParser()(req, null, function() {});
		if (!req.cookies.authentication) return next(new Error('not authorized'));
		
		authCookie = JSON.parse(new Buffer(req.cookies.authentication, 'base64').toString());
		if (!authCookie || !authCookie.access_token) return next(new Error('not authorized'));

        AccessTokenModel.findOne({ token: authCookie.access_token }, function(err, token) {
            if (err) { return next(err); }
            if (!token) { return next(new Error('not authorized')); }

            UserModel.findById(token.userId, function(err, user) {
                if (err) { return next(err); }
                if (!user) { return next(new Error('Unknown user')); }

                socket.request.user = user;
                
                next(null, user);
            });
        });

	});

	io.on('connection', function (socket) {
		if (!io.clients) io.clients = {};
		io.clients[socket.request.user._id.toString()] = socket.id;
		console.log('[config/socketio.js]', '#47', 'attached user ID: ' + socket.request.user._id.toString() + ' to socket: ' + socket.id);
		socket.on('payment_received', function (from, data) {
			console.log('socket.io payment_received = '+JSON.stringify(data));
		});

	});
	
	return io;
}