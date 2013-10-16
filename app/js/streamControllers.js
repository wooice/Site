'use strict';

/* Controllers */

angular.module('stream.controllers', []).
    controller('streamCtrl', ['$scope', 'config', '$location', 'Stream', 'Sound', 'SoundUtilService', 'SoundSocial', '$routeParams', 'UserService', function ($scope, config, $location, Stream, Sound, SoundUtilService, SoundSocial, $routeParams, UserService) {
        $scope.userService = UserService;
        $scope.routeParams =  $routeParams;

        function checkNewSound() {
            var count = Sound.hasNew({startTime: $scope.lastLoadedTime}, function () {
                $scope.newSoundCount = parseInt(count[0]);
            });
        }

        function checkNewCreated() {
            var count = Sound.hasNewCreated({userAlias: $routeParams.value, startTime: $scope.lastLoadedTime}, function () {
                $scope.newSoundCount = parseInt(count[0]);
            });
        }

        var soundsReLoad = null;
        if ($routeParams.value) {
            soundsReLoad = setInterval(checkNewCreated, 60 * 1000);
        }
        else {
            if (!$routeParams.q && !$routeParams.tag)
            {
                soundsReLoad = setInterval(checkNewSound, 60 * 1000);
            }
        }

        $scope.$on('$destroy', function (e) {
            if (soundsReLoad)
            {
                clearInterval(soundsReLoad);
            }
        });

        var rewriteF5 = function (e) {
            if (e.which === 116) {
                $scope.loadStream(true);
                return false;
            }
            if (e.which === 82 && e.ctrlKey) {
                $scope.loadStream(true);
                return false;
            }
        };

        $(document).bind('keydown keyup', rewriteF5);
        $scope.$on('$destroy', function (e) {
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
                    sound.soundSocial.likesCount = parseInt(likesCount.liked);
                });
            }
            else {
                var likesCount = SoundSocial.like({sound: sound.id}, null, function (count) {
                    sound.soundUserPrefer.like = 1;
                    sound.soundSocial.likesCount = parseInt(likesCount.liked);
                });
            }
            return false;
        }

        $scope.comment = function () {
            var postData = {};
            postData.comment = $('#sound_commentbox_input_' + this.sound.id).val();
            postData.pointAt = $('#sound_comment_point_' + this.sound.id).val();
//            postData.toUserAlias =  $('#sound_comment_to_' + this.sound.id).val();
            var result = SoundSocial.comment({sound: this.sound.id}, postData, function (count) {
                this.sound.soundSocial.commentsCount = result.commentsCount;
                $('#sound_commentbox_input_' + this.sound.id).val('');
                $('#sound_comment_point_' + this.sound.id).val(-1);
                $('#sound_commentbox_input_' + this.sound.id).attr("placeholder", "感谢您的留言!");
            });
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
                    sound.soundSocial.reportsCount = parseInt(repostsCount.reposted);
                });
            }
            else {
                var repostsCount = SoundSocial.repost({sound: sound.id}, null, function (count) {
                    sound.soundUserPrefer.repost = 1;
                    sound.soundSocial.reportsCount = parseInt(repostsCount.reposted);
                });
            }
            return false;
        }

            $scope.pageNum = 1;
            $scope.sounds = [];
            $scope.isloading = false;
            $scope.newSoundCount = 0;
            $scope.lastLoadedTime = new Date().Format("yyyy-MM-dd hh:mm:ss");
            $scope.userCurPage = $routeParams.value;

        $scope.loadStream = function (force) {
            if (force) {
                $scope.pageNum = 1;
                $scope.sounds = [];
                $(window).soundWave({}).cleanUp();
            }
            if ($scope.isloading) {
                return;
            }
            $scope.isloading = true;

            var postData = {};
            if($scope.$parent.curatedTags)
            {
                postData = [];
                $routeParams.filter = "tags";

                $.each($scope.$parent.curatedTags, function(index, tag){
                    if (tag.interested)
                    {
                        postData.push(tag.label);
                    }
                });
            }

            var soundsData = Stream.stream({filter: $routeParams.filter, value: $routeParams.value},postData, function () {
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

                    var sound = SoundUtilService.buildSound(soundRecord);

                    $scope.sounds.push(sound);
                    $scope.$apply();

                    //render wave
                    $(window).soundWave({}).render(
                        {
                            id: sound.id,
                            waveData: sound.waveData,
                            duration: sound.duration,
                            color: sound.color,
                            commentable: sound.comment.mode !== 'closed'
                        }
                    );

                    //record sound info
                    sound.waveData = null;
                    $(window).soundPlayer().addSound(sound);
                });

                if (soundsData.length >= config.soundsPerPage) {
                    $scope.pageNum++;
                }

                $scope.isloading = false;
                $scope.newSoundCount = 0;
                $scope.lastLoadedTime = new Date().Format("yyyy-MM-dd hh:mm:ss");

                var curSound = $(window).soundPlayer().getCurSound();
                if (curSound) {
                    $('#sound_player_button_' + curSound.id).addClass('icon-pause');
                    $('#cur_sound').attr('href', curSound.title.route);
                    $('#cur_sound').text(curSound.title.alias);
                }
            });
        };

        $(window).soundPlayer().setSocialClient(SoundSocial);
        $(window).soundWave({}).cleanUp();
        $scope.loadStream();

        var scrollHandler = function () {
            if ($(window).height() + $(window).scrollTop() >= ($('#sound_streams').height())) {
                $scope.loadStream();
            }
        };

        $(window).scroll(scrollHandler);
        $scope.$on('$destroy', function (e) {
            clearInterval(soundsReLoad);
            $(window).off("scroll", scrollHandler);
        });
    }])
;

