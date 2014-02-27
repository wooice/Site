'use strict';

/* Controllers */

angular.module('page.controllers', [])
    .controller('pageCtrl', ['$scope', '$rootScope', '$routeParams', 'User', 'UserSocial', 'SoundSocial',
        function ($scope, $rootScope, $routeParams, User, UserSocial, SoundSocial) {
            $rootScope.follow = function (user) {
                if (!user) {
                    return;
                }
                if (user.userPrefer && user.userPrefer.following) {
                    UserSocial.unfollow({toUserAlias: user.profile.alias}, null, function (followedCount) {
                        user.userPrefer.following = false;
                        user.userSocial.followed = followedCount.followed;
                    });
                }
                else {
                    UserSocial.follow({ toUserAlias: user.profile.alias}, null, function (followedCount) {
                        if (user.userPrefer) {
                            user.userPrefer.following = true;
                            user.userSocial.followed = followedCount.followed;
                        }
                    });
                }
            };

            $scope.like = function (sound) {
                if (!sound) {
                    return;
                }
                if (sound.soundUserPrefer && sound.soundUserPrefer.like) {
                    SoundSocial.unlike({ sound: sound.id}, null, function (likesCount) {
                        sound.soundUserPrefer.like = false;
                        sound.soundSocial.likesCount = likesCount.liked;
                    });
                }
                else {
                    SoundSocial.like({sound: sound.id}, null, function (likesCount) {
                        sound.soundUserPrefer.like = true;
                        sound.soundSocial.likesCount = likesCount.liked;
                    });
                }
            };

            $scope.repost = function (sound) {
                if (!sound) {
                    return;
                }
                if (sound.soundUserPrefer && sound.soundUserPrefer.repost) {
                    SoundSocial.unrepost({sound: sound.id}, null, function (repostsCount) {
                        sound.soundUserPrefer.repost = false;
                        sound.soundSocial.reportsCount = repostsCount.reposted;
                    });
                }
                else {
                    SoundSocial.repost({sound: sound.id}, null, function (repostsCount) {
                        sound.soundUserPrefer.repost = true;
                        sound.soundSocial.reportsCount = repostsCount.reposted;
                    });
                }
            };

        }]);