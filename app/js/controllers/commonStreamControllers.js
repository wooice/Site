'use strict';

/* Controllers */

angular.module('common.stream.controllers', [])
    .controller('recommandUserCtrl', ['$scope', 'config', '$routeParams', 'UserSocial', 'SoundSocial', function ($scope, config, $routeParams, UserSocial, SoundSocial) {
        $scope.pageNum = 1;
        $scope.pageSize = 8;
        var users = UserSocial.getRecommand({}, {pageNum: $scope.pageNum, pageSize: 5}, function () {
            $.each(users, function (index, user) {
                users.class = "";
                user.route = config.userStreamPath + user.profile.alias;
            });

            $scope.recommendUsers = users;
        });

        var sounds = SoundSocial.recommandSounds({}, function () {
            $.each(sounds, function (index, sound) {
                sound.route = 'sound/' + sound.profile.alias;
            });
            $scope.recommendSounds = sounds;
        });

        $scope.toogleFollow = function () {
            var recommendUser = this.recommendUser;
            if (recommendUser.follow) {
                recommendUser.follow = false;
                recommendUser.class = "";
            }
            else {
                recommendUser.follow = true;
                recommendUser.class = "user_selected";
            }
        }

        $scope.save = function () {
            var followedUser = [];

            $.each($scope.recommendUsers, function (index, user) {
                if (user.follow) {
                    followedUser.push(user);
                }
            });

            $.each(followedUser, function (index, user) {
                UserSocial.follow({toUserAlias: user.profile.alias}, null, function () {
                        $scope.msg = "关注成功，你将接收他们的上传与分享的声音";
                        $scope.msgClass = "text-success";
                    }, function () {
                        $scope.msg = "关注失败，请稍后再试";
                        $scope.msgClass = "text-warning";
                    }
                );
            });
        }

    }])
;

