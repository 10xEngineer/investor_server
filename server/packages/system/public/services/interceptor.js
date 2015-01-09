'use strict';

angular.module('mean-factory-interceptor', [])
	//Http Interceptor to check auth failures for XHR requests
	.config(['$httpProvider', function($httpProvider) {
		$httpProvider.responseInterceptors.push('httpInterceptor');
	}])

	.run(['$http', '$compile', 'SpinnerService', function ($http, $compile, SpinnerService) {
		$http.defaults.transformRequest.push(function(data, headersGetter) {
			SpinnerService.show($compile);
			return data;
		});
	}])

	.factory('httpInterceptor', ['$q', '$location', 'SpinnerService', 'Alert', function($q, $location, SpinnerService, Alert) {
		return function (promise) {
			return promise.then(
				function (response) {
					SpinnerService.hide();

					if (response && response.status === 401) {
						$location.path('/index');
						return $q.reject(response);
					}

					return response;
				}, 
				function (response) {
					SpinnerService.hide();   console.log(response);
					Alert.notify(response);
					
					if (response.status === 401) {
						$location.path('/index');
					}
					return $q.reject(response);
				}
			);
		};
	}])

	.service('SpinnerService', ['$rootScope', function ($rootScope) {
		var scope, div;

		function init($compile) {
			scope = $rootScope.$new(true);
			div = $compile(('<div id="spinner-service" ng-show="isVisible"><i class="fa fa-spinner fa-spin fa-3x"></i></div>'))(scope);
			jQuery('body').append(div);  
		}
		return {
			hide: function() {
				scope.isVisible = false;  
			},

			show: function($compile) {
				if (!scope) init($compile);

				scope.isVisible = true;  
			}

		}

	}])

;
