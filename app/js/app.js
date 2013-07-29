'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers', 'myApp.config', 'myApp.upload']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
    $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
    $routeProvider.when('/upload', {templateUrl: 'partials/upload.html'});
    $routeProvider.otherwise({redirectTo: '/view1'});
  }])
	.run(function($rootScope, config){
		$rootScope.config = config;
	});

