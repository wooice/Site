'use strict';

/* App Module */
angular.module('wooice', ['ngRoute', 'wooice.directives', 'wooice.config',
        'auth.services', 'guest.services', 'profile.services', 'sound.services', 'tag.services', 'storage.services', 'user.services', 'sound.pro.services', 'util.services',
        'auth.controllers', 'guest.controllers', 'profile.controllers', 'stream.controllers', 'common.stream.controllers', 'user.stream.controllers', 'footer.controllers', 'header.controllers', 'interest.controllers', 'message.services',
        'sound.controllers', 'upload.controllers']).

    config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.
            when('/stream', {templateUrl: 'partials/commonStream.html', controller: ''}).
            when('/stream/:value', {templateUrl: 'partials/userStream.html', controller: ''}).
            when('/stream/:filter/:value', {templateUrl: 'partials/commonStream.html', controller: ''}).
            when('/sound/:soundId', {templateUrl: 'partials/soundDetail.html', controller: 'soundDetailCtrl'}).
            when('/profile', {templateUrl: 'partials/userProfile.html', controller: 'userProfileCtrl'}).
            when('/upload', {templateUrl: 'partials/upload.html', controller: 'soundUploadCtrl'}).
            when('/interest', {templateUrl: 'partials/interest.html', controller: 'interestCtrl'}).
            when('/guest/login', {templateUrl: 'partials/guest/login.html', controller: 'loginCtrl'}).
            when('/guest/register', {templateUrl: 'partials/guest/register.html', controller: 'registerCtrl'}).
            when('/guest/forgetPass', {templateUrl: 'partials/guest/forgetPass.html', controller: 'forgetPassCtrl'}).
            when('/auth/confirm', {templateUrl: 'partials/auth/confirm.html', controller: 'confirmControl'}).
            when('/auth/changePass', {templateUrl: 'partials/auth/changePass.html', controller: 'changePassCtrl'}).
            when('/not_found', {templateUrl: 'partials/notFound.html', controller: ''}).
            when('/forbidden', {templateUrl: 'partials/forbidden.html', controller: ''}).
            otherwise({redirectTo: '/stream'});

        var httpErrors = ['$q', '$location', function ($q, $location) {
            var success = function (response) {
                return response;
            };

            var error = function (response) {
                switch (response.status) {
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
    .run(function ($rootScope, config, $location, $anchorScroll, $routeParams, Auth, UserService) {
        $rootScope.config = config;

        var routesThatDontRequireAuth = ['/guest', '/auth'];
        var routesThatForAdmins = ['/admin'];
        var routesNoCheck = ["/forbidden", "/not_found"];

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

        var noCheck = function (route) {
            return _.find(routesNoCheck,
                function (noCheckRoute) {
                    return _.str.startsWith(route, noCheckRoute);
                });
        }

        $rootScope.$on('$routeChangeStart', function (event, next, current) {
            if ($location.url()) {
                if (routeGuest($location.url()) && UserService.validateRoleGuest()) {
                    return;
                }

                if (noCheck($location.url())) {
                    return;
                }

                if (!routeGuest($location.url()) && UserService.validateRoleGuest()) {
                    $location.path('/guest/login');
                    return;
                }
            }

            var curUser = Auth.isAlive({}, function () {
                    UserService.setupUser({
                        userAlias: curUser.profile.alias,
                        role: curUser.userRoles[0].role
                    });

                    UserService.setColor(curUser.profile.color);

                    if ($location.url()) {
                        if (routeAdmin($location.url() && !UserService.validateRoleAdmin())) {
                            $location.path('/forbidden');
                        }
                    }
                    else {
                        if (UserService.validateRoleAdmin())
                        {
                            $location.path('/admin');
                        }
                        else
                        {
                            $location.path('/stream');
                        }
                    }
                },
                function (data) {
                    if (data.status == 403) {
                        $location.url('/forbidden');
                    }
                    else {
                        $location.url('/guest/login');
                    }
                });
        });

//        $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
//            $location.hash($routeParams.scrollTo);
//            $anchorScroll();
//        });
    });
