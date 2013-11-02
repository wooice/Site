'use strict';

/* Controllers */

angular.module('user.stream.controllers', [])
    .controller('userBasicController', ['$scope', 'config', '$routeParams', 'User', 'UserSocial', 'UserService', function ($scope, config, $routeParams, User, UserSocial, UserService) {
        $scope.curAlias = UserService.getCurUserAlias();
        var user = User.get({userAlias: $routeParams.value}, function () {
            $scope.user = user;

            if (user.profile.alias == UserService.getCurUserAlias()) {
                $scope.user.isCurrent = true;
            }

            if (!$scope.user.profile.avatorUrl) {
                $scope.user.profile.avatorUrl = 'img/default_avatar_large.png';
            }
            else
            {
                var avatorUrl = $.cookie($scope.user.profile.alias + '_avator_large_url');

                if (avatorUrl)
                {
                    $scope.user.profile.avatorUrl = avatorUrl;
                }
                else
                {
                    $.cookie($scope.user.profile.alias + '_avator_large_url', $scope.user.profile.avatorUrl, {expires: config.imageAccessExpires});
                }
            }
            if ($scope.user.userPrefer.following) {
                $scope.user.userPrefer.followingString = "关注中";
            }
            else {
                $scope.user.userPrefer.followingString = "关注";
            }

            var external = User.getExternal({userAlias: $routeParams.value}, function () {
                $scope.user.external =  external;
            });

            $scope.follow = function (userAlias) {
                if ($scope.user.userPrefer.following) {
                    var result = UserSocial.unfollow({toUserAlias: userAlias}, null, function (count) {
                        $scope.user.userPrefer.following = false;
                        $scope.user.userSocial.followed = result.followed;
                        $scope.user.userPrefer.followingString = "关注";
                    });
                }
                else {
                    var result = UserSocial.follow({ toUserAlias: userAlias}, null, function (count) {
                        $scope.user.userPrefer.following = true;
                        $scope.user.userSocial.followed = result.followed;
                        $scope.user.userPrefer.followingString = "关注中";
                    });
                }
            }
        });
    }])
    .controller('userHistoryCtrl', ['$scope', 'config', '$routeParams', 'Sound', 'SoundUtilService', 'UserService', function ($scope, config, $routeParams, Sound, SoundUtilService, UserService) {
        $scope.userService = UserService;
        $scope.histories = [];
        var histories = Sound.loadHistory({pageNum: 1, soundsPerPage: 6}, function(){
            $.each(histories, function(index, history){
                history = SoundUtilService.buildSound(history);
            });
            $scope.histories = histories;
        });
    }])
    .controller('userSocialController', ['$scope', 'config', '$routeParams', 'UserSocial', 'User', function ($scope, config, $routeParams, UserSocial, User) {
        var followed = UserSocial.getFollowed({userAlias: $routeParams.value, pageNum: 1}, function () {
            $.each(followed, function (index, user) {
                if (!user.profile.avatorUrl) {
                    user.profile.avatorUrl = "img/default_avatar.png";
                }
                else
                {
                    var avatorUrl = $.cookie($scope.user.profile.alias + '_avator_small_url');

                    if (avatorUrl)
                    {
                        $scope.user.profile.avatorUrl = avatorUrl;
                    }
                    else
                    {
                        $.cookie($scope.user.profile.alias + '_avator_small_url', $scope.user.profile.avatorUrl, {expires: config.imageAccessExpires});
                    }
                }
                user.route = config.userStreamPath + user.profile.alias;
            });
            $scope.followed = followed;
        });

        var following = UserSocial.getFollowing({userAlias: $routeParams.value, pageNum: 1}, function () {
            $.each(following, function (index, user) {
                if (!user.profile.avatorUrl) {
                    user.profile.avatorUrl = "img/default_avatar.png";
                }
                else
                {
                    var avatorUrl = $.cookie($scope.user.profile.alias + '_avator_small_url');

                    if (avatorUrl)
                    {
                        $scope.user.profile.avatorUrl = avatorUrl;
                    }
                    else
                    {
                        $.cookie($scope.user.profile.alias + '_avator_small_url', $scope.user.profile.avatorUrl, {expires: config.imageAccessExpires});
                    }
                }
                user.route = config.userStreamPath + user.profile.alias;
            });
            $scope.following = following;
        });
    }])
;