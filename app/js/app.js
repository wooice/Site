'use strict';

/* App Module */
angular.module('wooice', ['wooice.filters', 'wooice.controllers', 'wooice.config', 'wooice.module.upload', 'wooice.service.sound', 'wooice.service.user']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/stream', {templateUrl: 'partials/stream.html',   controller: 'streamCtrl'}).
      when('/stream/:userId', {templateUrl: 'partials/user-stream.html', controller: 'streamCtrl'}).
      when('/sound/:soundId', {templateUrl: 'partials/sound-detail.html', controller: 'soundDetailCtrl'}).
      when('/profile', {templateUrl: 'partials/user-profile.html', controller: 'UserCtrl'}).
      when('/upload', {templateUrl: 'partials/upload.html', controller: 'soundUploadCtrl'}).
      otherwise({redirectTo: '/stream'});
}])
	.run(function($rootScope, config){
		$rootScope.config = config;
	});
