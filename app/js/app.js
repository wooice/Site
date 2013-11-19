'use strict';

angular.module('wooice', ['ngRoute', 'ui.bootstrap', 'wooice.directives', 'wooice.config', 'wooice.player', 'wooice.waver', 'angularLocalStorage', 'feedback.services',
        'auth.services', 'guest.services', 'profile.services', 'sound.services', 'tag.services', 'storage.services', 'user.services', 'sound.pro.services', 'util.services', 'admin.services',
        'auth.controllers', 'guest.controllers', 'profile.controllers', 'stream.controllers', 'common.stream.controllers', 'user.stream.controllers', 'footer.controllers', 'header.controllers',
        'interest.controllers', 'message.services', 'sound.controllers', 'sound.social.controllers', 'player.controllers', 'upload.controllers', 'admin.controllers', 'infringe.controllers']).

    config(['$routeProvider', '$httpProvider',function ($routeProvider, $httpProvider) {
        $routeProvider.
            when('/stream', {templateUrl: 'partials/commonStream.html', controller: ''}).
            when('/stream/:value', {templateUrl: 'partials/userStream.html', controller: 'userBasicController'}).
            when('/stream/:filter/:value', {templateUrl: 'partials/commonStream.html', controller: ''}).
            when('/sound/:soundId', {templateUrl: 'partials/soundDetail.html', controller: ''}).
            when('/player/:soundId', {templateUrl: 'partials/player.html', controller: ''}).
            when('/iframe', {templateUrl: 'partials/iframe.html', controller: ''}).
            when('/infringement', {templateUrl: 'partials/infringement.html', controller: 'infringeCtrl'}).
            when('/profile', {templateUrl: 'partials/userProfile.html', controller: 'userProfileCtrl'}).
            when('/admin', {templateUrl: 'partials/adminHome.html', controller: 'userProfileCtrl'}).
            when('/upload', {templateUrl: 'partials/upload.html', controller: 'soundUploadCtrl'}).
            when('/interest', {templateUrl: 'partials/interest.html', controller: 'interestCtrl'}).
            when('/copyright', {templateUrl: 'partials/copyright.html', controller: ''}).
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
                        $location.url('/guest/login?relogin=true');
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

//        $locationProvider.html5Mode(true);
        $httpProvider.responseInterceptors.push(httpErrors);
    }])
    .run(function ($rootScope, config, $location, $anchorScroll, $routeParams, Auth, UserService, Guest) {
        if ($routeParams.relogin == 'true' && $.cookie('token'))
        {
            var user = {userId: UserService.getCurUserAlias(), token: $.cookie('token')};;
            UserService.tokenLogin({}, user, function(){
                $location.url('/stream');
            }, function(){
                $location.url('/guest/login');
            });
        }

        $rootScope.config = config;

        var routesThatDontRequireAuth = ['/guest', '/auth'];
        var routesThatForAdmins = ['/admin'];
        var routesNoCheck = ["/forbidden", "/not_found", "/player", "/iframe"];

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
                if (noCheck($location.url())) {
                    return;
                }
                if (routeAdmin($location.url()) && !UserService.validateRoleAdmin()) {
                    $location.path('/forbidden');
                    return;
                }
                if (!routeGuest($location.url()) && UserService.validateRoleGuest()) {
                    $location.path('/guest/login');
                    return;
                }
            }
            else {
                if (UserService.validateRoleAdmin()) {
                    $location.path('/admin');
                    return;
                }
                if (UserService.validateRoleGuest()) {
                    $location.path('/guest/login');
                }
                else {
                    $location.path('/stream');
                }
            }
        });

    });