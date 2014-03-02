'use strict';

/* Controllers */

angular.module('user.stream.controllers', [])
    .controller('userBasicController', ['$scope', 'config', '$routeParams', 'User', 'UserSocial', 'UserService',
        function ($scope, config, $routeParams, User, UserSocial, UserService) {
        $scope.curAlias = UserService.getCurUserAlias();
        var user = User.get({userAlias: $routeParams.value}, function () {
            $scope.user = user;

            if (user.profile.alias == UserService.getCurUserAlias()) {
                $scope.user.isCurrent = true;
            }

            if (!$scope.user.profile.avatorUrl || $scope.user.profile.avatorUrl=="img/default_avatar.png") {
                $scope.user.profile.avatorUrl = 'img/default_avatar_large.png';
            }

            var external = User.getExternal({userAlias: $routeParams.value}, function () {
                $scope.user.external =  external;
            });

            $scope.showMessage = function()
            {
                $('#message_modal').modal();
            }
        });
    }])
    .controller('userHistoryCtrl', ['$scope', 'config', '$routeParams', 'Sound', 'SoundUtilService', 'UserService', function ($scope, config, $routeParams, Sound, SoundUtilService, UserService) {
        $scope.userService = UserService;
        var histories = Sound.loadHistory({pageNum: 1, soundsPerPage: 6}, function(){
            $scope.histories = [];
            $.each(histories, function(index, history){
                $scope.histories.push(SoundUtilService.buildSound(history));
            });
        });
    }])
    .controller('userSocialController', ['$scope', 'config', '$routeParams', 'UserSocial', 'UserService', function ($scope, config, $routeParams, UserSocial, UserService) {
        $scope.routeParams = $routeParams;
        $scope.userService = UserService;
        var followed = UserSocial.getFollowed({userAlias: $routeParams.value, pageNum: 1}, function () {
            $.each(followed, function (index, user) {
                user.route = config.userStreamPath + user.profile.alias;
            });
            $scope.followed = followed;
        });

        var following = UserSocial.getFollowing({userAlias: $routeParams.value, pageNum: 1}, function () {
            $.each(following, function (index, user) {
                user.route = config.userStreamPath + user.profile.alias;
            });
            $scope.following = following;
        });
    }])
    .controller('userFollowingCtrl', ['$scope', 'config', '$routeParams', 'UserSocial', '$q', '$timeout', function ($scope, config, $routeParams, UserSocial, $q, $timeout) {
        $scope.users=[];
        $timeout(function(){
            $scope.modalId= "following_users_modal";
            $scope.title = $routeParams.value + "关注的声音";
        });

        $scope.showFollowingUser = function(){
            $("#" + $scope.modalId).modal({
                backdrop : false
            });
        }

        $scope.list = function (page) {
            var defer = $q.defer();
            $scope.loading = true;
            UserSocial.getFollowing({userAlias: $routeParams.value, pageNum: page, pageSize: 8}, function (users) {
                $.each(users, function (index, user) {
                    user.route = config.userStreamPath + user.profile.alias;
                });
                $scope.users = $scope.users.concat(users);
                $scope.loading = false;
                defer.resolve();
            }, function () {
            });
            return defer.promise;
        }

        $scope.count = function () {
            var defer = $q.defer();
            $scope.$watch('user', function(){
                if ($scope.user)
                {
                    defer.resolve($scope.user.userSocial.following);
                }
            });
            return defer.promise;
        }

    }])

    .controller('userFollowedCtrl', ['$scope', 'config', '$routeParams', 'UserSocial', '$q', '$timeout', function ($scope, config, $routeParams, UserSocial, $q, $timeout) {
        $scope.users=[];
        $timeout(function(){
            $scope.modalId = "followed_users_modal";
            $scope.title = $routeParams.value + "的Fans";
        });

        $scope.showFollowedUser = function(){
            $("#" + $scope.modalId).modal({
                backdrop : false
            });
        }

        $scope.list = function (page) {
            var defer = $q.defer();
            $scope.loading = true;
            UserSocial.getFollowed({userAlias: $routeParams.value, pageNum: page, pageSize: 8}, function (users) {
                $.each(users, function (index, user) {
                    user.route = config.userStreamPath + user.profile.alias;
                });
                $scope.users = $scope.users.concat(users);
                $scope.loading = false;
                defer.resolve();
            }, function () {
            });
            return defer.promise;
        }

        $scope.count = function () {
            var defer = $q.defer();
            $scope.$watch('user', function(){
                if ($scope.user)
                {
                    defer.resolve($scope.user.userSocial.followed);
                }
            });
            return defer.promise;
        }
    }])
;