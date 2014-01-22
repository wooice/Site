'use strict';

/* Controllers */

angular.module('interest.controllers', [])
    .controller('interestCtrl', ['$scope', 'config', '$routeParams', 'Tag', 'UserSocial',
        function ($scope, config, $routeParams, Tag, UserSocial) {
            $scope.pageNum = 1;
            $scope.pageSize = 11;
            $scope.curatedTags = [];
            $scope.recommendUsers = [];
            $scope.includePage = "";

            $scope.odd = function (cate) {
                return cate.id % 2 == 0;
            }

            $scope.even = function (cate) {
                return cate.id % 2 == 1;
            }

            var categories = Tag.categories({}, function () {
                $.each(categories, function (index, cate) {
                    cate.id = index;
                });
                $scope.categories = categories;
            });

            var tags = Tag.curated({}, function () {
                var interestedTags = [];
                $.each(tags, function (index, tag) {
                    if (tag.interested) {
                        tag.class = "#0089e0";
                        interestedTags.push(tag.label);
                    }
                    else {
                        tag.class = 'gray';
                    }
                    $scope.curatedTags.push(tag);
                });

                $scope.includePage = "partials/stream.html";

                var users = UserSocial.getRecommandByTags({}, {tags: interestedTags, pageNum: $scope.pageNum, pageSize: $scope.pageSize}, function () {
                    $.each(users, function (index, user) {
                        users.class = "";
                        if (!user.profile.avatorUrl) {
                            user.profile.avatorUrl = "img/default_avatar.png";
                        }
                        user.route = config.userStreamPath + user.profile.alias;
                    });
                    $.each(users, function (index, user) {
                        var exist = false;
                        $.each($scope.recommendUsers, function (index, recommendUser) {
                            if (user.profile.alias == recommendUser.profile.alias) {
                                exist = true;
                            }
                        });
                        if (!exist) {
                            $scope.recommendUsers.push(user);
                        }
                    });
                });
            });

            $scope.toogleInterest = function () {
                $scope.includePage = null;
                $scope.$apply();
                var curatedTag = this.curatedTag;

                if (curatedTag.interested) {
                    curatedTag.class = "gray";
                    curatedTag.interested = false;
                }
                else {
                    curatedTag.class = "#0089e0";
                    curatedTag.interested = true;
                }

                var interestedTags = {tags: [], pageNum: $scope.pageNum, pageSize: $scope.pageSize};
                $.each($scope.curatedTags, function (index, curatedTag) {
                    if (curatedTag.interested) {
                        interestedTags.tags.push(curatedTag.label);
                    }
                });

                var users = UserSocial.getRecommandByTags({}, interestedTags, function () {
                    $.each(users, function (index, user) {
                        users.class = "";
                        if (!user.profile.avatorUrl) {
                            user.profile.avatorUrl = "img/default_avatar.png";
                        }
                        user.route = config.userStreamPath + user.profile.alias;
                    });
                    $.each(users, function (index, user) {
                        var exist = false;
                        $.each($scope.recommendUsers, function (index, recommendUser) {
                            if (user.profile.alias = recommendUser.profile.alias) {
                                exist = true;
                            }
                        });
                        if (!exist) {
                            $scope.recommendUsers.push(user);
                        }
                    });
                });

                $scope.includePage = "partials/stream.html";
            }

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

        }]);