'use strict';

/* Controllers */

angular.module('wooice.controllers', []).
    controller('streamCtrl', ['$scope', 'config', 'Stream', 'Sound', 'SoundSocial', '$routeParams', 'UserService', function ($scope, config, Stream, Sound, SoundSocial, $routeParams, UserService) {

        $scope.togglePause = function (id) {
            var sound = null;
            $.each($scope.sounds, function (index, oneSound) {
                if (oneSound.id == id) {
                    sound = oneSound;
                    return;
                }
            });

            $(window).trigger('onToggle', {
                id: sound.id
            });
        };

        $scope.toggleLike = function (id) {
            var sound = null;
            $.each($scope.sounds, function (index, oneSound) {
                if (oneSound.id == id) {
                    sound = oneSound;
                    return;
                }
            });

            if (sound && sound.soundUserPrefer.like) {
                var likesCount = SoundSocial.unlike({ sound: sound.id}, null, function (count) {
                    sound.soundUserPrefer.like = 0;
                    sound.soundUserPrefer.likeWording = "Like";
                    sound.soundSocial.likesCount = parseInt(likesCount.liked);
                });
            }
            else {
                var likesCount = SoundSocial.like({sound: sound.id}, null, function (count) {
                    sound.soundUserPrefer.like = 1;
                    sound.soundUserPrefer.likeWording = "";
                    sound.soundSocial.likesCount = parseInt(likesCount.liked);
                });
            }
            return false;
        }

        $scope.isOwner = function () {
            return  this.sound.owner.alias == UserService.getCurUserAlias();
        }

        $scope.delete = function () {
            if (this.sound.owner.alias != UserService.getCurUserAlias()) {
                return;
            }

            if (confirm('确定要删除当前音乐吗?')) {
                Sound.delete({sound: this.sound.id}, function () {
                    var toDelete = 0;
                    $.each($scope.sounds, function (index, sound) {
                        if (this.sound.id == sound.id) {
                            toDelete = index;
                            return;
                        }
                    });
                    $scope.sounds.splice(toDelete, 1);
                    $scope.$apply();
                    $.globalMessenger().post({
                        message: "声音" + this.sound.id + "删除成功。",
                        hideAfter: 15,
                        showCloseButton: true
                    });
                });
            }
        }

        $scope.toggleRepost = function (id) {
            var sound = null;
            $.each($scope.sounds, function (index, oneSound) {
                if (oneSound.id == id) {
                    sound = oneSound;
                    return;
                }
            });

            if (sound && sound.soundUserPrefer.repost) {
                var repostsCount = SoundSocial.unrepost({sound: sound.id}, null, function (count) {
                    sound.soundUserPrefer.repost = 0;
                    sound.soundUserPrefer.repostWording = "转";
                    sound.soundSocial.reportsCount = parseInt(repostsCount.reposted);
                });
            }
            else {
                var repostsCount = SoundSocial.repost({sound: sound.id}, null, function (count) {
                    sound.soundUserPrefer.repost = 1;
                    sound.soundUserPrefer.repostWording = "";
                    sound.soundSocial.reportsCount = parseInt(repostsCount.reposted);
                });
            }
            return false;
        }

        $scope.$on('$viewContentLoaded', function () {
            $scope.pageNum = 1;
            $scope.sounds = [];
            $scope.loadClass = 'hide';
            $scope.noSoundMsg = 'hide';
            $scope.noSearchMsg = 'hide';
            $scope.noSearchMsgOther = 'hide';
            $scope.isloading = false;

            $(window).soundPlayer().setSocialClient(SoundSocial);

            loadStream();

            $(window).scroll(function () {
                if ($(window).height() + $(window).scrollTop() >= ($('#sound_streams').height())) {
                  loadStream();
                }
            });
        });

        function loadStream() {
            if ($scope.isloading) {
                return;
            }
            $scope.isloading = true;

            $scope.$apply(function () {
                $scope.loadClass = '';
            });

            var subPath = "";
            if ($routeParams.userId) {
                subPath = $routeParams.userId;
            }
            else {
                if ($routeParams.action) {
                    subPath = $routeParams.action;
                }
            }

            var params = {subPath: subPath, pageNum: $scope.pageNum};

            if ($routeParams.q) {
                params.q = $routeParams.q;
            }
            if ($routeParams.userAlias) {
                params.userAlias = UserService.getCurUserAlias();
            }

            var soundsData = Stream.stream(params, function () {
                $scope.loadClass = 'hide';
                $.each(soundsData, function (index, soundRecord) {
                    if (!soundRecord)
                    {
                        return;
                    }

                    var posterUrl = '';
                    if (!$routeParams.q) {
                        if (soundRecord.sound.profile.poster && soundRecord.sound.profile.poster.url) {
                            posterUrl = soundRecord.sound.profile.poster.url;
                        }
                        else {
                            posterUrl = "img/default_avatar.png";
                        }
                        var sound = {
                            id: soundRecord.sound.profile.alias,
                            waveData: soundRecord.sound.soundData.wave[0],
                            url: soundRecord.sound.soundData.url,
                            poster: posterUrl,
                            title: {alias: soundRecord.sound.profile.name, route: 'index.html#/sound/' + soundRecord.sound.profile.alias},
                            owner: {alias: soundRecord.sound.profile.owner.profile.alias, route: config.userStreamPath + soundRecord.sound.profile.owner.profile.alias},
                            duration: soundRecord.sound.soundData.duration * 1000,
                            soundSocial: soundRecord.sound.soundSocial,
                            soundUserPrefer: soundRecord.sound.userPrefer,
                            played: false
                        };
                    }
                    else {
                        if (soundRecord.profile.poster && soundRecord.profile.poster.url) {
                            posterUrl = soundRecord.profile.poster.url;
                        }
                        else {
                            posterUrl = "img/default_avatar.png";
                        }
                        var sound = {
                            id: soundRecord.profile.alias,
                            waveData: soundRecord.soundData.wave[0],
                            url: soundRecord.soundData.url,
                            poster: posterUrl,
                            title: {alias: soundRecord.profile.name, route: 'index.html#/sound/' + soundRecord.profile.alias},
                            owner: {alias: soundRecord.profile.owner.profile.alias, route: config.userStreamPath + soundRecord.profile.owner.profile.alias},
                            duration: soundRecord.soundData.duration * 1000,
                            soundSocial: soundRecord.soundSocial,
                            soundUserPrefer: soundRecord.userPrefer,
                            played: false
                        };
                    }
                    sound.soundUserPrefer.likeWording = (sound.soundUserPrefer.like) ? "" : "赞";
                    sound.soundUserPrefer.repostWording = (sound.soundUserPrefer.repost) ? "" : "转";

                    var hasSound = false;
                    $.each($scope.sounds, function (index, oneSound) {
                        if (oneSound.id === sound.id) {
                            hasSound = true;
                        }
                    });

                    if (hasSound) {
                        return;
                    }
                    $scope.sounds.push(sound);
                    $scope.$apply();

                    //render wave
                    var player = new $.player(sound);
                    player.renderSound();
                    sound.waveData = null;

                    //record sound info
                    $(window).soundPlayer().addSound({
                        id: sound.id,
                        duration: sound.duration
                    });

                    $('#sound_commentbox_input_' + sound.id).bind('keyup', function (event) {
                        if (event.keyCode == 13) {
                            var comment = $(this).val();
                            var sec = $("#sound_comment_point_" + sound.id).val();
                            if (!sec)
                            {
                                sec = -1;
                            }
                            var commentResult = SoundSocial.comment({sound: sound.id, comment: comment, pointAt: sec}, null, function (count) {
                                sound.soundSocial.commentsCount = commentResult.commentsCount;
                                $('#sound_commentbox_input_' + sound.id).val('');
                                $('#sound_commentbox_input_' + sound.id).attr("placeholder", "感谢您的留言!");
                            });
                        }
                    });
                });

                if (soundsData.length > 0) {
                    $scope.pageNum++;
                }
                if ($scope.sounds.length == 0) {
                    if(!$routeParams.q)
                    {
                        if ($routeParams.userId != UserService.getCurUserAlias()) {
                            $scope.noSoundMsg = 'hide';
                            $scope.noSearchMsgOther = '';
                            $scope.curUser = $routeParams.userId;
                        }
                        else
                        {
                            $scope.noSoundMsg = '';
                        }
                    }
                    else
                    {
                        $scope.noSearchMsg = ''
                    }
                }
                else {
                    $scope.noSearchMsg = 'hide';
                    $scope.noSoundMsg = 'hide';
                    $scope.noSearchMsgOther = 'hide';
                }

                $scope.isloading = false;
            });
        }
    }])

    .controller('soundDetailCtrl', ['$scope', 'config', '$routeParams', 'Sound', 'SoundSocial', 'SoundSocialList', 'UserService', function ($scope, config, $routeParams, Sound, SoundSocial, SoundSocialList, UserService) {
        $scope.togglePause = function (id) {
            var sound = $scope.sound;

            $(window).trigger('onToggle', {
                id: sound.id
            });
        };

        $scope.toggleLike = function (id) {
            var sound = $scope.sound;
            if (sound.soundUserPrefer.like) {
                var likesCount = SoundSocial.unlike({sound: sound.id}, null, function (count) {
                    sound.soundUserPrefer.like = 0;
                    sound.soundUserPrefer.likeWording = "赞";
                    sound.soundSocial.likesCount = parseInt(likesCount.liked);
                });
            }
            else {
                var likesCount = SoundSocial.like({sound: sound.id}, null, function (count) {
                    sound.soundUserPrefer.like = 1;
                    sound.soundUserPrefer.likeWording = "";
                    sound.soundSocial.likesCount = parseInt(likesCount.liked);

                    $(window).soundPlayer().toggle({
                        id: id
                    });
                });
            }
            return false;
        }

        $scope.toggleRepost = function (id) {
            var sound = $scope.sound;
            if (sound.soundUserPrefer.repost) {
                var repostsCount = SoundSocial.unrepost({sound: sound.id}, null, function (count) {
                    sound.soundUserPrefer.repost = 0;
                    sound.soundUserPrefer.repostWording = "转";
                    sound.soundSocial.reportsCount = parseInt(repostsCount.reposted);
                });
            }
            else {
                var repostsCount = SoundSocial.repost({sound: sound.id}, null, function (count) {
                    sound.soundUserPrefer.repost = 1;
                    sound.soundUserPrefer.repostWording = "";
                    sound.soundSocial.reportsCount = parseInt(repostsCount.reposted);
                });
            }
            return false;
        }

        $scope.$on('$viewContentLoaded', function () {
            $(window).soundPlayer().setSocialClient(SoundSocial);
            var sound = Sound.load({sound: $routeParams.soundId}, function () {
                var posterUrl = '';
                if (sound.profile.poster && sound.profile.poster.url) {
                    posterUrl = sound.profile.poster.url;
                }
                else {
                    posterUrl = "img/default_avatar.png";
                }
                $scope.sound = {
                    id: sound.profile.alias,
                    waveData: sound.soundData.wave[0],
                    url: sound.soundData.url,
                    poster: posterUrl,
                    title: {alias: sound.profile.name, route: 'index.html#/sound/' + sound.profile.alias},
                    owner: {alias: sound.profile.owner.profile.alias, route: config.userStreamPath + sound.profile.owner.profile.alias},
                    duration: sound.soundData.duration * 1000,
                    soundSocial: sound.soundSocial,
                    soundUserPrefer: sound.userPrefer,
                    played: false
                };

                if ($scope.sound.soundUserPrefer) {
                    $scope.sound.soundUserPrefer.likeWording = ($scope.sound.soundUserPrefer.like) ? "" : "Like";
                    $scope.sound.soundUserPrefer.repostWording = ($scope.sound.soundUserPrefer.repost) ? "" : "Repost";
                }

                //TODO
                $scope.$apply();

                var player = new $.player($scope.sound);
                player.renderSound();
                $scope.sound.waveData = null;

                //record sound info
                $(window).soundPlayer().addSound({
                    id: sound.id,
                    duration: sound.duration
                });

                $('#sound_commentbox_input_' + $scope.sound.id).bind('keyup', function (event) {
                    if (event.keyCode == 13) {
                        var comment = $(this).val();
                        var sec = $("#sound_comment_point_" + $scope.sound.id).val();
                        if (!sec)
                        {
                            sec = -1;
                        }
                        var result = SoundSocial.comment({sound: $scope.sound.id, comment: comment, pointAt: sec}, null, function (count) {
                            $scope.sound.soundSocial.commentsCount = result.commentsCount;
                            $('#sound_commentbox_input_' +  $scope.sound.id).val('');
                            $('#sound_commentbox_input_' +  $scope.sound.id).attr("placeholder", "感谢您的留言!");
                        });
                    }
                });

                $scope.commentPageNum = 1;
                var comments = SoundSocialList.comment({sound: $scope.sound.id, pageNum: $scope.commentPageNum}, function () {
                    $scope.comments = comments;
                    $.each($scope.comments, function (index, comment) {
                        if (!comment.owner.profile.avatorUrl) {
                            comment.owner.profile.avatorUrl = "img/default_avatar.png";
                            comment.owner.route = config.userStreamPath + comment.owner.profile.alias;
                        }
                    });
                });
            });
        });
    }])

    .controller('userBasicController', ['$scope', '$routeParams', 'User', 'UserSocial', 'UserService', function ($scope, $routeParams, User, UserSocial, UserService) {
        $scope.curAlias = UserService.getCurUserAlias();
        var user = User.get({userAlias: $routeParams.userId}, function () {
            $scope.user = user;

            if (user.profile.alias == UserService.getCurUserAlias()) {
                $scope.user.isCurrent = true;
            }

            if (!$scope.user.profile.avatorUrl) {
                $scope.user.profile.avatorUrl = 'img/default_avatar_large.png';
            }
            if ($scope.user.userPrefer.following) {
                $scope.user.userPrefer.followingString = "Following";
            }
            else {
                $scope.user.userPrefer.followingString = "Follow";
            }

            $scope.follow = function (userAlias) {
                if ($scope.user.userPrefer.following) {
                    var result = UserSocial.unfollow({toUserAlias: userAlias}, null, function (count) {
                        $scope.user.userPrefer.following = false;
                        $scope.user.userSocial.followed = result.followed;
                        $scope.user.userPrefer.followingString = "Follow";
                    });
                }
                else {
                    var result = UserSocial.follow({ toUserAlias: userAlias}, null, function (count) {
                        $scope.user.userPrefer.following = true;
                        $scope.user.userSocial.followed = result.followed;
                        $scope.user.userPrefer.followingString = "Following";
                    });
                }
            }
        });
    }])

    .controller('userSocialController', ['$scope', 'config', '$routeParams', 'UserSocial', 'User', function ($scope, config, $routeParams, UserSocial, User) {
        var user = User.get({userAlias: $routeParams.userId}, function () {
            $scope.user = user;
        });
        var followed = UserSocial.getFollowed({pageNum: 1}, function () {
            $.each(followed, function (index, user) {
                if (!user.profile.avatorUrl) {
                    user.profile.avatorUrl = "img/default_avatar.png";
                }
                user.route = config.userStreamPath + user.profile.alias;
            });
            $scope.followed = followed;
        });

        var following = UserSocial.getFollowing({pageNum: 1}, function () {
            $.each(following, function (index, user) {
                if (!user.profile.avatorUrl) {
                    user.profile.avatorUrl = "img/default_avatar.png";
                }
                user.route = config.userStreamPath + user.profile.alias;
            });
            $scope.following = following;
        });
    }])

    .controller('loginCtrl', ['$scope', '$location', 'Guest', 'UserService', function ($scope, $location, Guest, UserService) {
        $scope.userId = "";
        $scope.password = "";

        $scope.toLogin = function () {
            var user = {userId: $scope.userId, password: $scope.password};
            var curUser = Guest.login({}, user, function () {
                UserService.setupUser({
                    userAlias: curUser.profile.alias,
                    role: curUser.userRoles[0].role
                });
                $.globalMessenger().post({
                    message: curUser.profile.alias+"，欢迎回来！",
                    hideAfter: 10,
                    showCloseButton: true
                });
                if (UserService.validateRoleUser() || UserService.validateRoleAdmin()) {
                    $location.path('/stream');
                }
            }, function () {
                $scope.loginMsgClass = "text-warning";
                $scope.loginMsg = '失败了，用户名或密码错误';
            });
        }
    }])

    .controller('registerCtrl', ['$scope', '$location', 'Guest', 'UserService', 'User', function ($scope, $location, Guest, UserService, User) {
        $scope.userAlias = "";
        $scope.emailAddress = "";
        $scope.password1 = null;
        $scope.password2 = null;

        $scope.toRegister = function () {
            var user = {userAlias: $scope.userAlias, emailAddress: $scope.emailAddress, password: $scope.password1};
            var curUser = Guest.create({}, user, function () {
                var login = {userId: $scope.userAlias, password: $scope.password1};
                curUser = Guest.login({}, login, function () {
                    UserService.setupUser({
                        userAlias: $scope.userAlias,
                        role: curUser.userRoles[0].role
                    });
                    User.confirm({userAlias: $scope.userAlias, emailAddress: $scope.emailAddress}, null, function () {
                        $location.url('/interest');
                    });
                });
            });
        }
    }])

    .controller('heaederCtrl', ['$scope', '$location', '$routeParams', 'User', 'UserService', function ($scope, $location, $routeParams, User, UserService) {
        $scope.q = $routeParams.q;
        $scope.userAlias = UserService.getCurUserAlias();
        $scope.logout = function () {
            User.logout({}, function () {
                UserService.setupUser(null);
                $.globalMessenger().post({
                    message: "感谢您的使用",
                    hideAfter: 10,
                    showCloseButton: true
                });
                $location.path('/login');
            })
        };

        $scope.goto = function (uri) {
            $location.url(uri);
        }

        $('#search_box').bind('keyup', function (event) {
            if (event.keyCode == 13) {
                $scope.$apply(function () {
                    $location.url('/stream/do/search\?q=' + $scope.q);
                });
            }
        });

    }])

    .controller('userProfileCtrl', ['$scope', '$routeParams', function ($scope, $routeParams, $http) {
        $scope.innerPage = 'partials/user/basicProfile.html';

        $scope.jumpTo = function (page) {
            $scope.innerPage = 'partials/user/' + page + '.html';
        }
    }])

    .controller('recommandUserCtrl', ['$scope', 'config', '$routeParams', 'UserSocial', function ($scope, config, $routeParams, UserSocial) {
        $scope.pageNum = 1;
        $scope.pageSize = 8;
        var users = UserSocial.getRecommand({}, {pageNum: $scope.pageNum, pageSize: $scope.pageSize}, function () {
            $.each(users, function (index, user) {
                users.class = "";
                if (!user.profile.avatorUrl) {
                    user.profile.avatorUrl = "img/default_avatar.png";
                }
                user.route = config.userStreamPath + user.profile.alias;
            });

            $scope.recommendUsers = users;
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
    .controller('interestCtrl', ['$scope', 'config', '$routeParams', 'Tag', 'UserSocial', function ($scope, config, $routeParams, Tag, UserSocial) {
        $scope.pageNum = 1;
        $scope.pageSize = 8;
        $scope.curatedTags = [];
        $scope.recommendUsers = [];

        var users = UserSocial.getRecommandByTags({}, {tags: [], pageNum: $scope.pageNum, pageSize: $scope.pageSize}, function () {
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

        $scope.odd = function (cate) {
            return cate.id % 2 == 0;
        }

        $scope.even = function (cate) {
            return cate.id % 2 == 1;
        }

        $scope.filterTags = function (a, b) {
            console.log('a');
        }

        var categories = Tag.categories({}, function () {
            $.each(categories, function (index, cate) {
                cate.id = index;
            });
            $scope.categories = categories;
        });

        var tags = Tag.curated({}, function () {
            $.each(tags, function (index, tag) {
                tag.interested = false;
                tag.class = 'gray';
                $scope.curatedTags.push(tag);
            });
        });

        $scope.toogleInterest = function () {
            var curatedTag = this.curatedTag;

            if (curatedTag.interested) {
                curatedTag.class = "gray";
                curatedTag.interested = false;
            }
            else {
                curatedTag.class = "green";
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

    }])
    .controller('confirmControl', ['$scope', 'config', '$location', '$routeParams', 'Auth', function ($scope, config, $location, $routeParams, Auth) {
        $scope.result = "";
        if ($routeParams.confirmCode) {
            Auth.doConfirm({confirmCode: $routeParams.confirmCode}, function () {
                $scope.result = "邮件确认成功！请开始您的发现声音之旅。";
            }, function () {
                $scope.result = "邮件确认失败，请确认您收到的激活邮件重新尝试,或重新发送邮件";
            });
        }
        else {
            if ($routeParams.resetCode) {
                var result = Auth.verifyReset({action: "confirm", code: $routeParams.resetCode}, function () {
                    if (result.result) {
                        $location.url('/auth/changePass?code=' + $routeParams.resetCode);
                    } else {
                        $scope.result = "验证失败，请确认您有权进行当前操作。";
                    }
                });
            }
            else {
                if ($routeParams.cancelCode) {
                    var result = Auth.verifyReset({action: "cancel", code: $routeParams.cancelCode}, function () {
                        if (result.result) {
                            $scope.result = "取消修改成功，感谢您的协助。";
                        } else {
                            $scope.result = "验证失败，请确认您有权进行当前操作。";
                        }
                    });
                }
            }
        }
    }])

    .controller('changePassCtrl', ['$scope', '$routeParams', 'Auth', function ($scope, $routeParams, Auth) {
        $scope.oldPassword = null;
        $scope.password1 = null;
        $scope.password2 = null;
        $scope.confirmCode = $routeParams.code;

        $scope.changePass = function () {
            var postData = {};
            postData.confirmCode = $scope.confirmCode;
            postData.oldPassword = $scope.oldPassword;
            postData.newPassword = $scope.password1
            Auth.changePass({}, postData, function () {
                $scope.messageClass = "text-success";
                $scope.message = "密码修改成功！";
            }, function () {
                $scope.messageClass = "text-error";
                $scope.message = "密码修改失败，请稍后再试";
            });
        }
    }])

    .controller('submitChangePassCtrl', ['$scope', '$routeParams', 'User', function ($scope, $routeParams, User) {
        $scope.confirmCode = $routeParams.code;

        $scope.changePass = function () {
            User.submitPassChange({}, {}, function () {
                $scope.messageClass = "text-success";
                $scope.message = "提交成功，我们已发送密码修改链接到您的邮箱，请查收后修改密码。";
            }, function () {
                $scope.messageClass = "text-error";
                $scope.message = "提交失败，请确认您是否已通过邮件确认，并再次尝试";
            });
        }
    }])

    .controller('forgetPassCtrl', ['$scope', '$routeParams', 'Guest', function ($scope, $routeParams, Guest) {
        $scope.emailAddress = null;
        $scope.show = true;

        $scope.toSubmit = function () {
            var passObj = {};
            passObj.emailAddress = $scope.emailAddress;
            Guest.reportForget({}, passObj, function () {
                $scope.messageClass = "text-success";
                $scope.message = "提交成功，我们已发送密码修改链接到您的邮箱，请查收后修改密码。";
                $scope.show = false;
            }, function () {
                $scope.messageClass = "text-error";
                $scope.message = "提交失败，请稍后再试";
            });
        }
    }])

    .controller("footerCtrl", ['$scope', '$routeParams', 'User', function($scope, $routeParams, User){
        var messages = User.listMessages({}, function(){
            $.each(messages, function(index, message){
                $.globalMessenger().post({
                    message: message.content,
                    hideAfter: 0,
                    showCloseButton: true
                });

                var postData = {};
                postData.toUser = message.to.profile.alias;
                postData.id =  message.id;
                postData.status = "read";
                User.markMessage({},postData, function(){});
            });
        });
    }]);
;

