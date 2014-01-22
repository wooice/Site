'use strict';

/* Controllers */

angular.module('stream.controllers', []).
    controller('streamCtrl', ['$scope', 'config', '$location', '$timeout', 'Stream', 'Sound', 'PlayList', 'CurSoundList', 'SoundUtilService', 'SoundSocial', '$routeParams', 'UserService', 'WooicePlayer', 'WooiceWaver', 'storage', 'WaveStorage',
        function ($scope, config, $location, $timeout, Stream, Sound, PlayList, CurSoundList, SoundUtilService, SoundSocial, $routeParams, UserService, WooicePlayer, WooiceWaver, storage, WaveStorage) {
            $scope.config = config;
            $scope.userService = UserService;
            $scope.routeParams = $routeParams;
            $scope.wooicePlayer = WooicePlayer;
            $scope.curSoundList = CurSoundList

            window.onbeforeunload = function (event) {
                // when user leave the page, record the current status of the sound.
                for (var soundIndex in CurSoundList.getList()) {
                    var oneSound = WooicePlayer.getSoundFromPlayer(CurSoundList.getList()[soundIndex].id);
                    if (oneSound && oneSound.position != null) {
                        var playing = false;
                        var curSound = WooicePlayer.getCurSound();
                        if (curSound && curSound.id == oneSound.id) {
                            playing = curSound.isPlaying;
                        }
                        storage.set(oneSound.id + "_player", {
                            id: oneSound.id,
                            from: oneSound.position,
                            playing: playing
                        });
                    }
                }

                //record wave status
                WooiceWaver.recordWaveStatus();
            }

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

            if (!UserService.validateRoleGuest()) {
                var soundsReLoad = null;
                if ($routeParams.value) {
                    soundsReLoad = setInterval(checkNewCreated, 60 * 1000);
                }
                else {
                    if (!$routeParams.q && !$routeParams.tag) {
                        soundsReLoad = setInterval(checkNewSound, 60 * 1000);
                    }
                }
                $scope.$on('$destroy', function (e) {
                    if (soundsReLoad) {
                        clearInterval(soundsReLoad);
                    }

                    CurSoundList.reset();
                });
            }

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
                $.each(CurSoundList.getList(), function (index, oneSound) {
                    if (oneSound.id == id) {
                        sound = oneSound;
                        return;
                    }
                });

                WooicePlayer.toggle(sound);
            };

            $scope.toggleLike = function (id) {
                var sound = null;
                $.each(CurSoundList.getList(), function (index, oneSound) {
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

            $scope.download = function () {
                var sound = SoundSocial.play({sound: this.sound.id}, null, $.proxy(function (count) {
                    var downloadUrl = sound.url + "&download/" + this.sound.alias + ".mp3";

                    var downloadFrame = document.createElement("iframe");
                    downloadFrame.src = downloadUrl;
                    downloadFrame.style.display = "none";
                    document.body.appendChild(downloadFrame);
                }, this));
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
                }, function (error) {
                    if (error.data == 'INVALID_COMMENT') {
                        $('#sound_commentbox_input_' + $scope.sound.id).val('');
                        $('#sound_commentbox_input_' + $scope.sound.id).attr("placeholder", "对不起，您的评论含有敏感词，请慎重输入");
                    }
                    else {
                        $('#sound_commentbox_input_' + $scope.sound.id).val('');
                        $('#sound_commentbox_input_' + $scope.sound.id).attr("placeholder", "对不起，您的评论输入失败，请稍后再试");
                    }
                });
            }

            $scope.delete = function () {
                if (this.sound.owner.alias != UserService.getCurUserAlias()) {
                    return;
                }

                if (confirm('确定要删除当前音乐吗?')) {
                    Sound.delete({sound: this.sound.id}, $.proxy(function () {
                        WooicePlayer.destroy({
                            id: this.sound.id
                        });

                        storage.remove(this.sound.id + "_wave");
                        PlayList.removeSound(this.sound);

                        var toDelete = 0;
                        $.each(CurSoundList.getList(), $.proxy(function (index, oneSound) {
                            if (this.sound.id == oneSound.id) {
                                toDelete = index;
                                return;
                            }
                        }, this));
                        CurSoundList.getList().splice(toDelete, 1);
                        $scope.$apply();

                        storage.remove(this.sound.id + "_player", null);
                        storage.remove(this.sound.id + "_wave", null);

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
                $.each(CurSoundList.getList(), function (index, oneSound) {
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
            CurSoundList.reset();
            $scope.isloading = false;
            $scope.newSoundCount = 0;
            $scope.lastLoadedTime = new Date().Format("yyyy-MM-dd hh:mm:ss");
            $scope.userCurPage = $routeParams.value;

            $scope.loadStream = function (force) {
                if (force) {
                    $scope.pageNum = 1;
                    CurSoundList.reset();
                }
                if ($scope.isloading) {
                    return;
                }
                $scope.isloading = true;

                var postData = {};
                if ($scope.$parent.curatedTags) {
                    postData = [];
                    $routeParams.filter = "tags";

                    $.each($scope.$parent.curatedTags, function (index, tag) {
                        if (tag.interested) {
                            postData.push(tag.label);
                        }
                    });
                }

                var soundsData = Stream.stream({filter: $routeParams.filter, value: $routeParams.value, pageNum: $scope.pageNum}, postData, function () {
                    $.each(soundsData, function (index, soundRecord) {
                        if (!soundRecord) {
                            return;
                        }
                        var hasSound = false;
                        $.each(CurSoundList.getList(), function (index, oneSound) {
                            if (oneSound.id === soundRecord.id) {
                                hasSound = true;
                            }
                        });

                        if (hasSound) {
                            return;
                        }

                        var sound = SoundUtilService.buildSound(soundRecord);

                        CurSoundList.getList().push(sound);

                        if (PlayList.getSound(sound.id))
                        {
                            PlayList.addSound(sound);
                        }
                    });

                    $timeout(function () {
                        loadWave(CurSoundList.getList(), 0);
                    }, 0);

                    $.each(CurSoundList.getList(), function (index, oneSound) {
                        var soundPlayStatus = storage.get(oneSound.id + "_player");
                        if (soundPlayStatus && soundPlayStatus.playing) {
                            WooicePlayer.play(oneSound);
                        }
                    });


                    if (CurSoundList.getList().length >= config.soundsPerPage) {
                        $scope.pageNum++;
                    }

                    $scope.isloading = false;
                    $scope.newSoundCount = 0;
                    $scope.lastLoadedTime = new Date().Format("yyyy-MM-dd hh:mm:ss");

                    $('.hasTooltip').each(function () {
                        $(this).qtip({
                            content: {
                                text: $(this).next('div')
                            },
                            show: {
                                event: 'click'
                            },
                            hide: {
                                event: 'unfocus'
                            },
                            position: {
                                at: 'bottom left',
                                target: $(this)
                            },
                            style: {
                                def: false,
                                classes: 'tip qtip-rounded qtip-bootstrap'
                            }
                        });
                    });
                });
            };

            function loadWave(sounds, index) {
                if (index >= sounds.length) {
                    return;
                }
                var oneSound = sounds[index];
                if (oneSound.processed) {
                    var waveData = WaveStorage.get({remoteId: oneSound.remoteId + ".png"}, function () {
                        WooiceWaver.render(
                            {
                                id: oneSound.id,
                                waveData: waveData.waveData[0],
                                duration: oneSound.duration * 1000,
                                color: UserService.getColor(),
                                commentable: oneSound.comment.mode !== 'closed'
                            }
                        );

                        delete waveData.waveData;

                        loadWave(sounds, index + 1);
                    });
                }
                else {
                    loadWave(sounds, index + 1);
                }
            }

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

            function toTopBar(toTopEle, mainBody) {
                this.backToTop = toTopEle;
                this.mainBody = mainBody;
                this.load = function () {
                    this.backToTop.fadeOut();
                    $(window).bind('scroll', $.proxy(function (event) {
                        $(window).scrollTop() > 100 ? this.backToTop.fadeIn() : this.backToTop.fadeOut();
                    }, this));
                    this.backToTop.bind('click', function (event) {
                        if (event) {
                            event.preventDefault();
                        }
                        $("html, body").animate({scrollTop: 0}, 1000);
                    });
                }
            }

            new toTopBar($('#back_top'), $('#sound_streams')).load();
        }])
;

