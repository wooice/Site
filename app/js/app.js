'use strict';

/* App Module */
angular.module('wooice', ['ngRoute','wooice.filters','wooice.directives', 'wooice.controllers', 'wooice.config', 'wooice.module.upload', 'wooice.service.sound', 'wooice.service.user', 'wooice.service.tag','wooice.controller.profile','wooice.service.userProfile', 'wooice.service.guest', 'wooice.service.auth']).
    config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.
            when('/stream', {templateUrl: 'partials/stream.html', controller: 'streamCtrl'}).
            when('/stream/do/:action', {templateUrl: 'partials/stream.html', controller: 'streamCtrl'}).
            when('/stream/user/:userId', {templateUrl: 'partials/user-stream.html', controller: 'streamCtrl'}).
            when('/sound/:soundId', {templateUrl: 'partials/sound-detail.html', controller: 'soundDetailCtrl'}).
            when('/profile', {templateUrl: 'partials/user-profile.html', controller: 'userProfileCtrl'}).
            when('/upload', {templateUrl: 'partials/uploadV2.html', controller: 'soundUploadCtrl'}).
            when('/interest', {templateUrl: 'partials/interest.html', controller: 'interestCtrl'}).
            when('/guest/login', {templateUrl: 'partials/guest/login.html', controller: 'loginCtrl'}).
            when('/guest/register', {templateUrl: 'partials/guest/register.html', controller: 'registerCtrl'}).
            when('/guest/forgetPass', {templateUrl: 'partials/guest/forgetPass.html', controller: 'forgetPassCtrl'}).
            when('/auth/confirm', {templateUrl: 'partials/auth/confirm.html', controller: 'confirmControl'}).
            when('/auth/changePass', {templateUrl: 'partials/auth/changePass.html', controller: 'changePassCtrl'}).
            when('/not_found', {templateUrl: 'partials/not_found.html', controller: ''}).
            when('/forbidden', {templateUrl: 'partials/forbidden.html', controller: ''}).
            otherwise({redirectTo: '/stream'});

        var httpErrors = ['$q', '$location', function ($q, $location) {
            var success = function (response) {
                return response;
            };

            var error = function (response) {
                switch(response.status)
                {
                    case 401:
                        $location.url('/guest/login');
                        return $q.reject(response);
                    case 403:
                        $location.url('/forbidden');
                        return $q.reject(response);
                    case 404:
                        $location.url('/not_found');
                        return $q.reject(response);
                    default:
                        return $q.reject(response);
                }
            };

            return function (promise) {
                return promise.then(success, error);
            };
        }];

        $httpProvider.responseInterceptors.push(httpErrors);
    }])
    .run(function ($rootScope, config, $location, Auth, UserService) {
        $rootScope.config = config;

        var routesThatDontRequireAuth = ['/guest', '/auth'];
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
            if (routeGuest($location.url()) && UserService.validateRoleGuest() )
            {
               return;
            }

            var curUser = Auth.isAlive({},function () {
                UserService.setupUser({
                    userAlias: curUser.profile.alias,
                    role: curUser.userRoles[0].role
                });

                UserService.setColor(curUser.profile.color);

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
            function(data){
                if (data.status == 403)
                {
                    $location.url('/forbidden');
                }
                else
                {
                    $location.url('/guest/login');
                }
            });
        });
    });
