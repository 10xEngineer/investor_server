'use strict';

var paths = {
	//js: ['packages/api/**/*.js', '!packages/system/**/*.js', '!packages/**/public/**/*.js'],
	js: ['packages/api/**/*.js'],
	html: ['packages/**/public/**/views/**', 'packages/**/server/views/**'],
	css: ['!bower_components/**', 'packages/**/public/**/css/*.css']
};

module.exports = function(grunt) {

	if (process.env.NODE_ENV !== 'production') {
		require('time-grunt')(grunt);
	}

	// Project Configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		assets: grunt.file.readJSON('config/assets.json'),
		clean: ['bower_components/build'],
		watch: {
			js: {
				files: paths.js,
				tasks: [/*'jshint'*/],
				options: {
					livereload: true
				}
			},
			html: {
				files: paths.html,
				options: {
					//livereload: true,
					interval: 500
				}
			},
			css: {
				files: paths.css,
				tasks: [/*'csslint'*/],
				options: {
					//livereload: true
				}
			},
			less: {
				files: ['packages/**/public/**/less/*.less'],
				tasks: ['less'],
				options: {
					//livereload: true
				}
			}
		},
		jshint: {
			all: {
				src: paths.js,
				options: {
					jshintrc: true
				}
			}
		},
		uglify: {
			core: {
				options: {
					mangle: false
				},
				files: '<%= assets.core.js %>'
			}
		},
		csslint: {
			options: {
				csslintrc: '.csslintrc'
			},
			src: paths.css
		},
		cssmin: {
			core: {
				files: '<%= assets.core.css %>'
			}
		},
		nodemon: {
			dev: {
				script: 'server.js',
				options: {
					args: [],
					ignore: ['node_modules/**', 'packages/**/public/**'],
					ext: 'js,html',
					nodeArgs: [],
					delayTime: 1,
					cwd: __dirname
				}
			}
		},
		less: {
			dev: {
				options: {
					paths: ["packages/client/public/assets/less/**"]
				},
				files: {
					"packages/client/public/assets/css/client.css": "packages/client/public/assets/less/client.less"
				}
			},
		},
		'node-inspector': {
			dev: {
				options: {
					'web-port': 3000,
					'web-host': 'localhost',
					'debug-port': 5857,
					'save-live-edit': true,
					'no-preload': true,
					'stack-trace-limit': 4,
					'hidden': ['node_modules']
				}
			}
		},
		concurrent: {
			tasks: ['nodemon', /*'node-inspector',*/ 'watch'],
			options: {
				logConcurrentOutput: true
			}
		},
		mochaTest: {
			options: {
				reporter: 'spec',
				require: [
					'server.js',
					function() {
						require('meanio/lib/util').preload(__dirname + '/packages/**/server', 'model');
					}
				]
			},
			src: ['packages/**/server/tests/**/*.js']
		},
		env: {
			test: {
				NODE_ENV: 'test'
			}
		},
		karma: {
			unit: {
				configFile: 'karma.conf.js'
			}
		}
	});

	//Load NPM tasks
	require('load-grunt-tasks')(grunt);
	require('grunt-node-inspector')(grunt);

	//Default task(s).
	if (process.env.NODE_ENV === 'production') {
		grunt.registerTask('default', ['clean', 'cssmin', 'uglify', 'concurrent']);
	} else {
		grunt.registerTask('default', [/*'clean', 'jshint', 'csslint',*/ 'concurrent']);
	}

	//Test task.
	grunt.registerTask('test', ['env:test', 'mochaTest', 'karma:unit']);

	// For Heroku users only.
	// Docs: https://github.com/linnovate/mean/wiki/Deploying-on-Heroku
	grunt.registerTask('heroku:production', ['cssmin', 'uglify']);
};
