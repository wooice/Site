(function ($) {
    $.fn.soundPlayer = function (options) {
        if (window.soundPlayer) {
            return window.soundPlayer;
        }

        var socialClient = null;

        function init() {
            var settings;
            var soundData = {};
            settings = $.extend(
                {
                    'swfUrl': 'lib/soundmanager/swf/',
                    'preferFlash': true,
                    'volume': 50,
                    'multiShot': false
                },
                options
            );
            soundData.settings = settings;
            //init sound's id list, which will cache sounds
            soundData.soundList = [];
            //current sound id.
            soundData.currentSound = null;

            return soundData;
        }

        $.extend(this, {
            addSound: function (sound) {
                if (soundData.soundList[sound.id]) {
                    return;
                }

                sound.inited = false;
                soundData.soundList[sound.id] = sound;
            }
        });

        $.extend(this, {
            updateAlias: function (sound) {
                var target = soundData.soundList[sound.id];
                if (target)
                {
                    if (sound.id == soundData.currentSound)
                    {
                        $('#cur_sound').attr('href', soundData.soundList[soundData.currentSound].title.route);
                        $('#cur_sound').text(soundData.soundList[soundData.currentSound].title.alias);
                    }
                }
            }
        });

        $.extend(this, {
            loadFromCache: function (sound) {
                for (var oneSound in soundData.soundList) {
                    if (sound.alias == soundData.soundList[oneSound].alias) {
                        return soundData.soundList[oneSound];
                    }
                }

                return null;
            }
        });

        $.extend(this, {
            getCurSound: function () {
                return soundData.soundList[soundData.currentSound];
            }
        });

        $.extend(this, {
            setSocialClient: function (client) {
                socialClient = client;
            }
        });

        $.extend(this, {
            setup: function (sound) {
                soundManager.setup({
                    url: soundData.settings.swfUrl,
                    preferFlash: soundData.settings.preferFlash,

                    onready: function () {
                        var playOption = $.extend(
                            {
                                'id': 'defaultSoundId',
                                'url': '',
                                'autoLoad': false,
                                'autoPlay': false,
                                'stream': true,
                                'multiShot': false
                            },
                            sound
                        );
                        var miliSecPerMove = 1800 / sound.duration;

                        var soundStream = soundManager.createSound({
                            id: playOption.id,
                            url: playOption.url,
                            autoLoad: playOption.autoLoad,
                            autoPlay: playOption.autoPlay,
                            stream: playOption.stream,
                            multiShot: playOption.multiShot,

                            onload: function () {
                                console.log(this.id + ' loaded.');
                                soundManager._writeDebug(this.id + ' loaded.');
                            },
                            onplay: function () {
                                if (soundData.currentSound != this.id) {
                                    var pre = soundData.currentSound;
                                    soundData.currentSound = this.id;
                                    soundManager.pause(pre);
                                    $('#sound_player_button_' + soundData.currentSound).removeClass('icon-pause');
                                }

                                soundManager._writeDebug('Starting sound: ' + this.id);

                                $(window).trigger('onPlay', {
                                    id: this.id
                                });

                                $('#cur_sound').attr('href', soundData.soundList[soundData.currentSound].title.route);
                                $('#cur_sound').text(soundData.soundList[soundData.currentSound].title.alias);

                                $('#sound_player_button_' + this.id).addClass('icon-pause');
                                $('#sound_player_button_global').addClass('icon-pause');
                            },
                            whileloading: function () {
                                soundManager._writeDebug(this.id + ': loading ' + this.bytesLoaded + ' / ' + this.bytesTotal);
                                $(window).trigger('onLoading', {
                                    id: this.id,
                                    soundBytesloaded: this.bytesLoaded,
                                    soundBytesTotal: this.bytesTotal
                                });
                            },
                            whileplaying: function () {
                                $(window).trigger('onPlaying', {
                                    id: this.id,
                                    soundPosition: this.position
                                });
                            },
                            onpause: function () {
                                soundManager._writeDebug('Sound paused: ' + this.id);
                                $(window).trigger('onPause', {
                                    id: this.id
                                });

                                soundData.currentSound = null;

                                $('#sound_player_button_' + this.id).removeClass('icon-pause');
                                $('#sound_player_button_global').removeClass('icon-pause');
                            },
                            onresume: function () {
                                if (soundData.currentSound != this.id) {
                                    var pre = soundData.currentSound;
                                    soundData.currentSound = this.id;
                                    soundManager.pause(pre);
                                    $('#sound_player_button_' + soundData.currentSound).removeClass('icon-pause');
                                    $('#sound_player_button_global').removeClass('icon-pause');
                                }

                                soundManager._writeDebug('Resuming sound: ' + this.id);
                                $(window).trigger('onResume', {
                                    id: this.id
                                });

                                $('#cur_sound').attr('href', soundData.soundList[soundData.currentSound].title.route);
                                $('#cur_sound').text(soundData.soundList[soundData.currentSound].title.alias);

                                $('#sound_player_button_' + this.id).addClass('icon-pause');
                                $('#sound_player_button_global').addClass('icon-pause');
                            },
                            onfinish: function () {
                                soundData.currentSound = null;
                                $(window).trigger('onFinish', {
                                    id: this.id
                                });
                            }
                        });

                        if (playOption.autoPlay) {
                            soundStream.play(playOption);
                        }
                    },

                    ontimeout: function () {
                        soundManager._writeDebug('Sound load timeout: ' + this.id);
                    },

                    onfinish: function () {
                        soundManager._writeDebug('Sound play finished. ' + this.id);
                    }
                });
            }
        });

        $.extend(this, {
            jump: function (sound) {
                var soundToJump = null;
                if (soundData.currentSound && soundData.currentSound == sound.id) {
                    soundToJump = soundData.currentSound;
                }
                else {
                    soundToJump = sound.id;
                }

                var soundToJump = soundManager.getSoundById(soundToJump);

                if (!soundToJump) {
                    return false;
                }

                if (soundToJump.readyState === 0) { // hasn't started loading yet...
                    // load the whole sound, and play when it's done
                    soundToJump.load({
                        onload: function () {
                            this.play({
                                position: sound.from
                            });
                        }
                    });
                } else if (soundToJump.readyState === 3) {
                    soundToJump.setPosition(sound.from);
                }
            }
        });

        $.extend(this, {
            toggle: function (input) {
                if (input && input.id) {
                    var sound = soundData.soundList[input.id];
                }
                else {
                    if (soundData.currentSound) {
                        var sound = soundData.soundList[soundData.currentSound];
                    }
                    else {
                        var sound = null;
                        for (var oneSound in soundData.soundList) {
                            if (!sound) {
                                sound = soundData.soundList[oneSound];
                                break;
                            }
                        }
                    }
                }

                if (!sound) {
                    return;
                }
                if (!sound.inited) {
                    var playsCount = socialClient.play({sound: sound.id}, null, function (count) {
                        sound.url = playsCount.url;
                        sound.autoPlay = true;
                        $(window).soundPlayer().setup(sound);

                        sound.inited = true;
                        $('#play_count_' + sound.id).text(playsCount.played);
                    });
                }
                else {
                    soundManager.togglePause(sound.id);
                }

                return sound;
            }
        });

        $.extend(this, {
            playSibling: function (sibling) {
                var sound = null;
                if (sibling == 'next') {
                    var length = 0, pre = null, cur = null, soundKey = null;
                    for (var oneSound in soundData.soundList) {
                        if (cur && !soundKey) {
                            soundKey = oneSound;
                        }
                        if (soundData.currentSound === oneSound) {
                            cur = oneSound;
                        }
                        pre = oneSound;
                        length++;
                    }
                    if (length == 0) {
                        return;
                    }
                    if (cur === null || pre === cur) {
                        soundKey = null;
                        for (var oneSound in soundData.soundList) {
                            if (!soundKey) {
                                soundKey = oneSound;
                                break;
                            }
                        }
                    }
                    sound = soundData.soundList[soundKey];
                }
                else {
                    var length = 0, soundKey = null, found = false;
                    for (var oneSound in soundData.soundList) {
                        if (soundData.currentSound === oneSound) {
                            found = true;
                        }
                        if (!found) {
                            soundKey = oneSound;
                        }
                        length++;
                    }
                    if (length == 0) {
                        return;
                    }
                    else {
                        if (null == soundKey) {
                            for (var oneSound in soundData.soundList) {
                                soundKey = oneSound;
                            }
                        }
                    }

                    sound = soundData.soundList[soundKey];
                }

                if (!sound) {
                    return;
                }
                if (!sound.inited) {
                    var playsCount = socialClient.play({sound: sound.id}, null, function (count) {
                        sound.url = playsCount.url;
                        sound.autoPlay = true;
                        $(window).soundPlayer().setup(sound);

                        sound.inited = true;
                        $('#play_count_' + sound.id).text(playsCount.played);
                    });
                }
                else {
                    soundManager.togglePause(sound.id);
                }

                return sound;
            }
        });

        $.extend(this, {
            setVolume: function (sound) {
                soundManager.setVolume(sound.id, sound.volume);
            }
        });

        $.extend(this, {
            stop: function (sound) {
                soundManager.stop(sound.id);
            }
        });

        $.extend(this, {
            destroy: function (sound) {
                soundManager.destroySound(sound.id);
            }
        });

        function setupListeners() {
            $(window).bind('onJump', $.proxy(function (event, sound) {
                this.jump(sound);
            }, this));
            $(window).bind('onToggle', $.proxy(function (event, sound) {
               return  this.toggle(sound);
            }, this));
            $(window).bind('onPlaySibling', $.proxy(function (event, sibling) {
              return  this.playSibling(sibling);
            }, this));
            $(window).bind('onSoundDestory', $.proxy(function (event, sound) {
                this.destroy(sound);
            }, this));
        }

        var soundData = init();
        $.proxy(setupListeners, this)();

        window.soundPlayer = this;
        return this;
    }
})(jQuery);