'use strict';

/* App Module */
angular.module('wooice', ['wooice.filters', 'wooice.controllers', 'wooice.config', 'wooice.module.upload', 'wooice.service.sound', 'wooice.service.user', 'wooice.service.tag', 'wooice.service.guest']).
    config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.
            when('/stream', {templateUrl: 'partials/stream.html', controller: 'streamCtrl'}).
            when('/stream/:userId', {templateUrl: 'partials/user-stream.html', controller: 'streamCtrl'}).
            when('/sound/:soundId', {templateUrl: 'partials/sound-detail.html', controller: 'soundDetailCtrl'}).
            when('/profile', {templateUrl: 'partials/user-profile.html', controller: 'UserCtrl'}).
            when('/upload', {templateUrl: 'partials/upload.html', controller: 'soundUploadCtrl'}).
            when('/guest/login', {templateUrl: 'partials/guest/login.html', controller: 'loginCtrl'}).
            otherwise({redirectTo: '/stream'});

        var logsOutUserOn401 = ['$q', '$location', function ($q, $location) {
            var success = function (response) {
                return response;
            };

            var error = function (response) {
                if (response.status === 401 || response.status === 403) {
                    //redirect them back to login page
                    $location.path('/guest/login');

                    return $q.reject(response);
                }
                else {
                    return $q.reject(response);
                }
            };

            return function (promise) {
                return promise.then(success, error);
            };
        }];

        $httpProvider.responseInterceptors.push(logsOutUserOn401);
    }])
    .run(function ($rootScope, config, $location, User, UserService) {
        $rootScope.config = config;

        var routesThatDontRequireAuth = ['/guest'];
        var routesThatForAdmins = ['/admin'];

        // check if current location matches route
        var routeGuest = function (route) {
            return _.find(routesThatDontRequireAuth,
                function (noAuthRoute) {
                    return _.str.startsWith(route, noAuthRoute);
                });
        };

        // check if current location matches route
        var routeAdmin = function (route) {
            return _.find(routesThatForAdmins,
                function (noAuthRoute) {
                    return _.str.startsWith(route, noAuthRoute);
                });
        };

        $rootScope.$on('$routeChangeStart', function (event, next, current) {
            var curUser = User.isAlive({},function () {
                UserService.setupUser({
                    userAlias: curUser.profile.userAlias,
                    role: curUser.userRoles[0].role
                });

                if (routeGuest($location.url()) && !UserService.validateRoleGuest() )
                {
                    //If a non guest hits a hit
                    if (UserService.validateRoleUser() || UserService.validateRoleAdmin())
                    {
                        $location.path('/stream');
                    }
                }
                else
                {
                    // if route requires auth and user is not logged in
                    if (!routeGuest($location.url()) && UserService.validateRoleGuest()) {
                        // If a guest hits a non-guest url, redirect back to login
                        $location.path('/guest/login');
                    }
                    else if (routeAdmin($location.url() && !UserService.validateRoleAdmin())) {
                        //If a non-admin hits a admin url, redirect to login page
                        $location.path('/guest/login');
                    }
                }
            },
            function(){
                $location.path('/guest/login');
            });
        });
    });
