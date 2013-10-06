'use strict';

/* Controllers */

angular.module('wooice.controllers', []).
    controller('streamCtrl', ['$scope', 'config', 'Stream', 'Sound', 'SoundSocial', '$routeParams', 'UserService', function ($scope, config, Stream, Sound, SoundSocial, $routeParams, UserService) {
        function checkNewSound() {
            var count = Sound.hasNew({startTime: $scope.lastLoadedTime}, function () {
                $scope.newSoundCount = parseInt(count[0]);
            });
        }
        function checkNewCreated() {
            var count = Sound.hasNewCreated({userAlias: $routeParams.userId,startTime: $scope.lastLoadedTime}, function () {
                $scope.newSoundCount = parseInt(count[0]);
            });
        }

        if (!$routeParams.q)
        {
           if ($routeParams.userId)
           {
               var soundsReLoad = setInterval(checkNewCreated, 60 * 1000);
           }
            else
           {
               var soundsReLoad = setInterval(checkNewSound, 60 * 1000);
           }

            $scope.$on('$destroy', function(e) {
                clearInterval(soundsReLoad);
            });
        }

        var rewriteF5 = function(e) {
            if(e.which === 116) {
                $scope.loadStream(true);
                return false;
            }
            if(e.which === 82 && e.ctrlKey) {
                $scope.loadStream(true);
                return false;
            }
        };

        $(document).bind('keydown keyup', rewriteF5);
        $scope.$on('$destroy', function(e) {
            $(document).unbind('keydown keyup', rewriteF5);
        });

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
                    sound.soundUserPrefer.likeWording = "赞";
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

        $scope.isCurUser = function() {
            return $routeParams.userId == UserService.getCurUserAlias();
        }

        $scope.delete = function () {
            if (this.sound.owner.alias != UserService.getCurUserAlias()) {
                return;
            }

            if (confirm('确定要删除当前音乐吗?')) {
                Sound.delete({sound: this.sound.id}, $.proxy(function () {
                    $(window).trigger('onSoundDestory', {
                        id: this.sound.id
                    });

                    var toDelete = 0;
                    $.each($scope.sounds, $.proxy(function (index, oneSound) {
                        if (this.sound.id == oneSound.id) {
                            toDelete = index;
                            return;
                        }
                    }, this));
                    $scope.sounds.splice(toDelete, 1);
                    $scope.$apply();
                    $.globalMessenger().post({
                        message: "声音" + this.sound.alias + "删除成功。",
                        hideAfter: 15,
                        showCloseButton: true
                    });
                }, this));
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
            $scope.isloading = false;
            $scope.newSoundCount = 0;
            $scope.lastLoadedTime = new Date().Format("yyyy-MM-dd hh:mm:ss");
            $scope.userCurPage = $routeParams.userId;

            $(window).soundPlayer().setSocialClient(SoundSocial);

            $scope.loadStream();

            var scrollHandler = function () {
                if ($(window).height() + $(window).scrollTop() >= ($('#sound_streams').height())) {
                    $scope.loadStream();
                }
            };

            $(window).scroll(scrollHandler);
            $scope.$on('$destroy', function(e) {
                clearInterval(soundsReLoad);
                $(window).off("scroll", scrollHandler);
            });
        });

        $scope.loadStream = function (force) {
            if (force) {
                $scope.pageNum = 1;
                $scope.sounds = [];
            }
            if ($scope.isloading) {
                return;
            }
            $scope.isloading = true;

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
                $.each(soundsData, function (index, soundRecord) {
                    if (!soundRecord) {
                        return;
                    }
                    var hasSound = false;
                    $.each($scope.sounds, function (index, oneSound) {
                        if (oneSound.alias === soundRecord.profile.alias) {
                            hasSound = true;
                        }
                    });

                    if (hasSound) {
                        return;
                    }

                    var sound = {
                        id: soundRecord.id,
                        alias: soundRecord.profile.alias,
                        waveData: soundRecord.soundData.wave[0],
                        url: soundRecord.soundData.url,
                        poster: soundRecord.profile.poster.url,
                        title: {alias: soundRecord.profile.name, route: 'index.html#/sound/' + soundRecord.profile.alias},
                        owner: {alias: soundRecord.profile.owner.profile.alias, route: config.userStreamPath + soundRecord.profile.owner.profile.alias},
                        duration: soundRecord.soundData.duration * 1000,
                        soundSocial: soundRecord.soundSocial,
                        soundUserPrefer: soundRecord.userPrefer,
                        color: UserService.getColor(),
                        played: false
                    };
                    sound.soundUserPrefer.likeWording = (sound.soundUserPrefer.like) ? "" : "赞";
                    sound.soundUserPrefer.repostWording = (sound.soundUserPrefer.repost) ? "" : "转";

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
                            var postData = {};
                            postData.comment = $(this).val();
                            postData.pointAt = $("#sound_comment_point_" + sound.id).val();
                            postData.toUserAlias = null;
                            var commentResult = SoundSocial.comment({sound: sound.id}, postData, function (count) {
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

                $scope.isloading = false;
                $scope.newSoundCount = 0;
                $scope.lastLoadedTime = new Date().Format("yyyy-MM-dd hh:mm:ss");
            });
        }
    }])

    .controller('soundDetailCtrl', ['$scope', '$window', 'config', '$routeParams', 'Sound', 'Storage', 'SoundSocial', 'SoundSocialList', 'UserService', '$location',
        function ($scope, $window, config, $routeParams, Sound, Storage, SoundSocial, SoundSocialList, UserService, $location) {
            var rewriteF5 = function(e) {
                if(e.which === 116) {
                    $scope.loadSound();
                    return false;
                }
                if(e.which === 82 && e.ctrlKey) {
                    $scope.loadSound();
                    return false;
                }
            };

            $(document).bind('keydown keyup', rewriteF5);
            $scope.$on('$destroy', function(e) {
                $(document).unbind('keydown keyup', rewriteF5);
            });

            $scope.comments = [];
            $scope.loadClass = 'hide';
            $scope.commentPageNum = 1;

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
                    });
                }
                return false;
            }

            $scope.isOwner = function () {
                return  $scope.sound.owner.alias == UserService.getCurUserAlias();
            }

            $scope.isCommentOwner = function () {
                return  this.comment.owner.profile.alias == UserService.getCurUserAlias();
            }

            $scope.deleteComment = function () {
                if (confirm('确定要删除这条评论吗?')) {
                    var result = SoundSocial.uncomment({sound: $scope.sound.id, commentId: this.comment.commentId}, {}, function () {
                        $.globalMessenger().post({
                            message: '评论删除成功',
                            hideAfter: 15,
                            showCloseButton: true
                        });
                        $scope.reloadComments();
                        $scope.sound.soundSocial.commentsCount = result.commentsCount;
                    });
                }
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

            $scope.reply = function () {
                this.comment.showReply = !this.comment.showReply;
            }

            $scope.reloadComments = function () {
                $scope.commentPageNum = 1;
                $scope.comments = [];
                loadComments();
            }

            $scope.replyComment = function () {
                var postData = {};
                postData.comment = this.comment.reply;
                postData.pointAt = this.comment.pointAt;
                postData.toUserAlias = this.comment.owner.profile.alias;
                var result = SoundSocial.comment({sound: $scope.sound.id}, postData, $.proxy(function (count) {
                    $scope.sound.soundSocial.commentsCount = result.commentsCount;
                    $('#sound_comment_reply_input_' + this.$index).val('');
                    $('#sound_comment_reply_input_' + this.$index).attr("placeholder", "感谢您的回复!");

                    loadComments(true);
                }, this));
            }

            $scope.editSoundAlias = function () {
                if (!$scope.sound.title.readonly && $scope.sound.id) {
                    var postData = {};
                    postData.name = $scope.sound.title.alias;
                    var sound = Sound.update({sound: $scope.sound.id}, postData, function () {
                        $location.url('/sound/' + sound.profile.alias);
                    });
                }
                $scope.sound.title.readonly = !$scope.sound.title.readonly;
            }

            $scope.editSoundDescription = function () {
                if (!$scope.sound.description.readonly && $scope.sound.id) {
                    var postData = {};
                    postData.description = $scope.sound.description.context;
                    var profile = Sound.update({sound: $scope.sound.id}, postData, function () {
                    });
                }
                $scope.sound.description.readonly = !$scope.sound.description.readonly;
            }

            $scope.editSoundStatus = function () {
                if (!$scope.sound.status.readonly && $scope.sound.id) {
                    var postData = {};
                    postData.status = $scope.sound.status.value;
                    var profile = Sound.update({sound: $scope.sound.id}, postData, function () {
                    });
                }
                $scope.sound.status.readonly = !$scope.sound.status.readonly;
            }

            $('#poster_upload').change(function () {
                var oFReader = new FileReader();
                oFReader.onload = function (oFREvent) {
                    $("#poster_img").attr('src', oFREvent.target.result);
                };
                oFReader.readAsDataURL(this.files[0]);
            });

            $scope.uploadPosterUrl = "http://up.qiniu.com";
            $scope.isUploadingPoster = false;

            $('#poster_upload').fileupload({
                url: $scope.uploadPosterUrl,
                dataType: 'json',
                acceptFileTypes: /\.(gif|jpg|jpeg|tiff|png)$/i,
                dropZone: null,

                add: function (e, data) {
                    if (!(/\.(gif|jpg|jpeg|tiff|png)$/i).test(data.files[0].name)) {
                        $.globalMessenger().post({
                            message: '您上传的海报图片可能不正确，请上传以下格式中的一种:gif, jpg, jpeg, tiff, png。',
                            hideAfter: 15,
                            showCloseButton: true
                        });
                        return;
                    }
                    if (data.files[0].size > 10000000) {
                        $.globalMessenger().post({
                            message: '您上传的文件过大，请上传小于10MB的海报图片。',
                            hideAfter: 15,
                            showCloseButton: true
                        });
                        return;
                    }

                    if (!$scope.sound.posterPosterId) {
                        $scope.sound.posterPosterId = new Date().getTime();
                    }
                    $scope.posterInfo = Storage.getImageUploadURL({key: $scope.sound.posterPosterId}, function () {
                        data.formData = {key: $scope.sound.posterPosterId, token: $scope.posterInfo.token};
                        data.submit();
                    });
                },
                submit: function (e, data) {
                    $scope.isUploadingPoster = true;
                    $('#cancel_img_upload').click(function () {
                        data.abort();
                        $scope.$apply(function () {
                            $scope.isUploadingPoster = false;
                        });
                    });
                },
                progress: function (e, data) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    $scope.$apply(function () {
                        $scope.imgUploadMsg = '已上传' + progress + '%';
                    });
                },
                send: function (e, data) {
                    $scope.imgUploadMsgClass = "text-info";
                    $scope.imgUploadMsg = '已上传0%';
                },
                done: function (e, data) {
                    var soundProfile = {};
                    soundProfile.poster = {};
                    soundProfile.poster.posterId = $scope.sound.posterPosterId;
                    soundProfile.poster.extension = $scope.sound.posterExtension;
                    Sound.update({sound: $scope.sound.id}, soundProfile, function (count) {
                        $scope.isUploadingPoster = false;
                        $scope.imgUploadMsgClass = "hide";
                        $.globalMessenger().post({
                            message: "声音海报更新成功！",
                            hideAfter: 10,
                            showCloseButton: true
                        });
                    });
                },
                fail: function (e, data) {
                    $scope.isUploadingPoster = false;
                    if (data.errorThrown === 'abort') {
                        $scope.imgUploadMsgClass = "text-success";
                        $scope.imgUploadMsg = '海报上传已取消。';
                    }
                    else {
                        $.globalMessenger().post({
                            message: "海报图片上传失败，请稍后再试。",
                            hideAfter: 10,
                            showCloseButton: true
                        });
                    }
                }
            });

            $scope.loadSound = function ()
            {
                $(window).soundPlayer().setSocialClient(SoundSocial);

                var sound = Sound.load({sound: $routeParams.soundId}, function () {
                    $scope.sound = {
                        id: sound.id,
                        alias: sound.profile.alias,
                        waveData: sound.soundData.wave[0],
                        url: sound.soundData.url,
                        poster: sound.profile.poster.url,
                        posterPosterId: sound.profile.posterId,
                        title: {alias: sound.profile.name, route: 'index.html#/sound/' + sound.profile.alias, readonly: true},
                        owner: {alias: sound.profile.owner.profile.alias, route: config.userStreamPath + sound.profile.owner.profile.alias},
                        description: {context: sound.profile.description, readonly: true},
                        duration: sound.soundData.duration * 1000,
                        soundSocial: sound.soundSocial,
                        soundUserPrefer: sound.userPrefer,
                        status: {value: sound.profile.status, readonly: true},
                        color: UserService.getColor(),
                        played: false
                    };

                    if ($scope.sound.soundUserPrefer) {
                        $scope.sound.soundUserPrefer.likeWording = ($scope.sound.soundUserPrefer.like) ? "" : "赞";
                        $scope.sound.soundUserPrefer.repostWording = ($scope.sound.soundUserPrefer.repost) ? "" : "转";
                    }

                    //TODO
                    $scope.$apply();

                    var player = new $.player($scope.sound);
                    player.renderSound();
                    $scope.sound.waveData = null;

                    //record sound info
                    $(window).soundPlayer().addSound({
                        id: $scope.sound.id,
                        duration: $scope.sound.duration
                    });

                    $('#sound_commentbox_input_' + $scope.sound.id).bind('keyup', function (event) {
                        if (event.keyCode == 13) {
                            var postData = {};
                            postData.comment = $(this).val();
                            postData.pointAt = $("#sound_comment_point_" + $scope.sound.id).val();
                            postData.toUserAlias = null;
                            var result = SoundSocial.comment({sound: $scope.sound.id}, postData, function (count) {
                                $scope.sound.soundSocial.commentsCount = result.commentsCount;
                                $('#sound_commentbox_input_' + $scope.sound.id).val('');
                                $('#sound_commentbox_input_' + $scope.sound.id).attr("placeholder", "感谢您的留言!");

                                loadComments(true);
                            });
                        }
                    });

                    loadComments();
                });

                var scrollComments = $.proxy(function () {
                    if ($(window).height() + $(window).scrollTop() >= ($('#sound_streams').height())) {
                        loadComments();
                    }
                }, this);
                $(window).scroll(scrollComments);
                $scope.$on('$destroy', function(e) {
                    $(window).off("scroll", scrollComments);
                });
            }

            $scope.$on('$viewContentLoaded', function () {
                $scope.loadSound();
            });

            function loadComments(force) {
                if (force) {
                    $scope.comments = [];
                    $scope.commentPageNum = 1;
                }
                $scope.loadClass = '';
                var comments = SoundSocialList.comment({sound: $scope.sound.id, pageNum: $scope.commentPageNum}, function () {
                    $.each(comments, function (index, comment) {
                        comment.showReply = false;
                        if (!comment.owner.profile.avatorUrl) {
                            comment.owner.profile.avatorUrl = "img/default_avatar.png";
                        }
                        comment.owner.route = config.userStreamPath + comment.owner.profile.alias;
                        if (comment.to) {
                            comment.to.route = config.userStreamPath + comment.to.profile.alias;
                        }
                        $scope.comments.push(comment);
                        $scope.$apply();
                    });

                    $scope.loadClass = 'hide';
                    if (comments.length > 0) {
                        $scope.commentPageNum++;
                    }
                });
            }
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
                $scope.user.userPrefer.followingString = "关注中";
            }
            else {
                $scope.user.userPrefer.followingString = "关注";
            }

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

    .controller('userSocialController', ['$scope', 'config', '$routeParams', 'UserSocial', 'User', function ($scope, config, $routeParams, UserSocial, User) {
        var user = User.get({userAlias: $routeParams.userId}, function () {
            $scope.user = user;
        });
        var followed = UserSocial.getFollowed({userAlias: $routeParams.userId, pageNum: 1}, function () {
            $.each(followed, function (index, user) {
                if (!user.profile.avatorUrl) {
                    user.profile.avatorUrl = "img/default_avatar.png";
                }
                user.route = config.userStreamPath + user.profile.alias;
            });
            $scope.followed = followed;
        });

        var following = UserSocial.getFollowing({userAlias: $routeParams.userId, pageNum: 1}, function () {
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
                UserService.setColor(curUser.profile.color);
                $.globalMessenger().post({
                    message: curUser.profile.alias + "，欢迎回来！",
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

    .controller('headerCtrl', ['$scope', '$location', '$routeParams', 'User', 'UserService', function ($scope, $location, $routeParams, User, UserService) {
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

        $scope.togglePause = function (id) {
            $(window).trigger('onToggle', {
            });
        };

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

    .controller('recommandUserCtrl', ['$scope', 'config', '$routeParams', 'UserSocial', 'SoundSocial', function ($scope, config, $routeParams, UserSocial, SoundSocial) {
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

        var sounds = SoundSocial.recommandSounds({}, function () {
            $.each(sounds, function (index, sound) {
                sound.route = 'index.html#/sound/' + sound.profile.alias;
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

    .controller('changePassCtrl', ['$scope', '$routeParams', '$location', 'Auth', function ($scope, $routeParams, $location, Auth) {
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
                $location.url("/guest/login");
            }, function (data) {
                $scope.messageClass = "text-error";
                if (data.status == 400) {
                    $scope.message = "密码修改失败，请确认您输入的当前密码正确且新旧密码不相同。";
                }
                else {
                    $scope.message = "密码修改失败，请稍后再试";
                }
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
            }, function (data) {
                $scope.messageClass = "text-error";
                if (data.status == 400) {
                    $scope.message = "提交失败，请确保您输入的邮箱正确";
                }
                else {
                    $scope.message = "提交失败，请稍后再试";
                }

            });
        }
    }])

    .controller("footerCtrl", ['$scope', '$routeParams', 'User','MessageService', function ($scope, $routeParams, User, MessageService) {
    }]);
;

