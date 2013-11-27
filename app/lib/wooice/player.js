'use strict';

angular.module('wooice.player', []).
    factory('WooicePlayer', ['config', 'storage', 'WooiceWaver', 'SoundSocial', 'UserService',
        function (config, storage, WooiceWaver, SoundSocial, UserService) {

            function init() {
                var settings;
                var soundData = {};
                settings = $.extend(
                    {
                        'swfUrl': 'lib/soundmanager/swf/',
                        'preferFlash': true,
                        'volume': 50,
                        'multiShot': false
                    }
                );
                soundData.settings = settings;
                //init sound's id list, which will cache sounds
                soundData.soundList = [];
                //current sound id.
                soundData.currentSound = null;

                return soundData;
            }

            var soundData = init();

            window.onbeforeunload = function (event) {
                // when user leave the page, record the current status of the sound.
                for (var oneSound in soundData.soundList) {
                    oneSound = soundManager.getSoundById(oneSound);
                    if (oneSound && oneSound.position != null) {
                        var playing = false;
                        if (soundData.currentSound && soundData.currentSound == oneSound.id) {
                            playing = true;
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

            soundData.getNextSoundId = function (id) {
                var length = 0, pre = null, cur = null, soundKey = null;
                for (var oneSound in soundData.soundList) {
                    if (cur && !soundKey) {
                        soundKey = oneSound;
                    }
                    if (id === oneSound) {
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
                            return oneSound;
                        }
                    }
                }
                return soundKey;
            }

            soundData.getRandomSoundId = function () {
                var length = 0;
                for (var oneSound in soundData.soundList) {
                    length++;
                }
                var random = Math.floor(Math.random() * length);
                var index = 0;
                for (var oneSound in soundData.soundList) {
                    if (index++ == random) {
                        return  oneSound;
                    }
                }
            }

            soundData.setup = function (sound) {
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

                                if (null == playOption.position) {
                                    var playerStatus = storage.get(this.id + "_player");
                                    soundData.jump(playerStatus);
                                }
                                else {
                                    if (playOption.position > 0) {
                                        soundData.jump({id: this.id, from: playOption.position});
                                    }
                                }
                            },
                            onplay: function () {
                                if (soundData.currentSound != this.id) {
                                    soundManager.pause(soundData.currentSound);
                                    soundData.currentSound = this.id;
                                    $('#sound_player_button_' + soundData.currentSound).removeClass('icon-pause');
                                }

                                soundManager._writeDebug('Starting sound: ' + this.id);

                                $('#cur_sound').attr('href', soundData.soundList[soundData.currentSound].title.route);
                                $('#cur_sound').text(soundData.soundList[soundData.currentSound].title.alias);

                                $('#sound_player_button_' + this.id).addClass('icon-pause');
                                $('#sound_player_button_global').addClass('icon-pause');

                                var playerStatus = storage.get(this.id + "_player");
                                if (playerStatus) {
                                    playerStatus.playing = true;
                                    storage.set(this.id + "_player", playerStatus);
                                }
                            },
                            whileloading: function () {
                                soundManager._writeDebug(this.id + ': loading ' + this.bytesLoaded + ' / ' + this.bytesTotal);
                                WooiceWaver.load({
                                    id: this.id,
                                    soundBytesloaded: this.bytesLoaded,
                                    soundBytesTotal: this.bytesTotal
                                });
                            },
                            whileplaying: function () {
                                WooiceWaver.move({
                                    id: this.id,
                                    soundPosition: this.position
                                });
                            },
                            onpause: function () {
                                soundManager._writeDebug('Sound paused: ' + this.id);
                                WooiceWaver.stop({
                                    id: this.id
                                });

                                soundData.currentSound = null;

                                $('#sound_player_button_' + this.id).removeClass('icon-pause');
                                $('#sound_player_button_global').removeClass('icon-pause');

                                var playerStatus = storage.get(this.id + "_player");
                                if (playerStatus) {
                                    playerStatus.playing = false;
                                    storage.set(this.id + "_player", playerStatus);
                                }
                            },
                            onresume: function () {
                                if (soundData.currentSound != this.id) {
                                    soundManager.pause(soundData.currentSound);
                                    soundData.currentSound = this.id;
                                    $('#sound_player_button_' + soundData.currentSound).removeClass('icon-pause');
                                }

                                soundManager._writeDebug('Resuming sound: ' + this.id);

                                $('#cur_sound').attr('href', soundData.soundList[soundData.currentSound].title.route);
                                $('#cur_sound').text(soundData.soundList[soundData.currentSound].title.alias);

                                $('#sound_player_button_' + this.id).addClass('icon-pause');
                                $('#sound_player_button_global').addClass('icon-pause');

                                var playerStatus = storage.get(this.id + "_player");
                                if (playerStatus) {
                                    playerStatus.playing = true;
                                    storage.set(this.id + "_player", playerStatus);
                                }
                            },
                            onfinish: function () {
                                var cur = soundManager.getSoundById(this.id);
                                cur.setPosition(0);
                                WooiceWaver.jump({
                                    id: this.id,
                                    soundPosition: 0
                                });
                                WooiceWaver.stop({
                                    id: this.id
                                });

                                soundData.currentSound = null;
                                $('#sound_player_button_' + this.id).removeClass('icon-pause');
                                $('#sound_player_button_global').removeClass('icon-pause');

                                var playerStatus = storage.get(this.id + "_player");
                                if (playerStatus) {
                                    playerStatus.playing = false;
                                    storage.set(this.id + "_player", playerStatus);
                                }

                                switch (UserService.getPlayMode()) {
                                    case 0:
                                        soundData.play({id: soundData.getNextSoundId(this.id), position: 0});
                                        break;
                                    case 1:
                                        soundData.play({id: this.id, position: 0});
                                        break
                                    case 2:
                                        soundData.play({id: soundData.getRandomSoundId(), position: 0});
                                        break;
                                    case 3:
                                        break;
                                    default:
                                        soundData.play({id: soundData.getNextSoundId(this.id), position: 0});
                                        break;
                                }
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
            };

            soundData.jump = function (sound) {
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

            soundData.play = function (input) {
                if (input && input.id) {
                    var sound = soundData.soundList[input.id];

                    if (!sound.inited) {
                        var playsCount = SoundSocial.play({sound: sound.id}, null, function (count) {
                            var url = $.cookie(sound.id + '_sound_url');

                            if (url) {
                                sound.url = url;
                            }
                            else {
                                sound.url = playsCount.url;
                                $.cookie(sound.id + '_sound_url', sound.url, {expires: config.soundAccessExpires, path:'/sounds'});
                            }

                            sound.autoPlay = true;
                            sound.lastPlayTime = new Date().getTime();
                            if (null != input.position) {
                                sound.position = input.position;
                            }
                            soundData.setup(sound);

                            sound.inited = true;
                            $('#play_count_' + sound.id).text(playsCount.played);
                        });
                    }
                    else {
                        soundManager.play(sound.id);
                    }
                }
            }

            soundData.toggle = function (input) {
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
                    var playsCount = SoundSocial.play({sound: sound.id}, null, function (count) {
                        var url = $.cookie(sound.id + '_sound_url');

                        if (url) {
                            sound.url = url;
                        }
                        else {
                            sound.url = playsCount.url;
                            $.cookie(sound.id + '_sound_url', sound.url, {expires: config.soundAccessExpires, path:'/sounds'});
                        }

                        sound.autoPlay = true;
                        sound.lastPlayTime = new Date().getTime();
                        soundData.setup(sound);

                        sound.inited = true;
                        $('#play_count_' + sound.id).text(playsCount.played);
                    });
                }
                else {
                    soundManager.togglePause(sound.id);
                }

                return sound;
            }

            function setupListeners() {
                $(window).bind('onJump', $.proxy(function (event, sound) {
                    soundData.jump(sound);
                }, this));

                $(window).bind('onToggle', $.proxy(function (event, sound) {
                    soundData.toggle(sound);
                }, this));
            }

            setupListeners();

            return {
                addSound: function (sound) {
                    if (soundData.soundList[sound.id]) {
                        return;
                    }

                    sound.inited = false;
                    soundData.soundList[sound.id] = sound;
                },

                updateAlias: function (sound) {
                    var target = soundData.soundList[sound.id];
                    if (target) {
                        if (sound.id == soundData.currentSound) {
                            $('#cur_sound').attr('href', soundData.soundList[soundData.currentSound].title.route);
                            $('#cur_sound').text(soundData.soundList[soundData.currentSound].title.alias);
                        }
                    }
                },

                loadFromCache: function (sound) {
                    for (var oneSound in soundData.soundList) {
                        if (sound.alias == soundData.soundList[oneSound].alias) {
                            return soundData.soundList[oneSound];
                        }
                    }

                    return null;
                },

                getCurSound: function () {
                    return soundData.soundList[soundData.currentSound];
                },

                setup: function (sound) {
                    soundData.setup(sound);
                },

                jump: function (sound) {
                    soundData.jump(sound);
                },

                toggle: function (input) {
                    return soundData.toggle(input);
                },

                play: function (input) {
                    soundData.play(input);
                },

                playSibling: function (sibling) {
                    var sound = null;
                    if (sibling == 'next') {
                        sound = soundData.soundList[soundData.getNextSoundId(soundData.currentSound)];
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
                    soundData.play({id: sound.id, position: 0});

                    return sound;
                },

                setVolume: function (sound) {
                    soundManager.setVolume(sound.id, sound.volume);
                },

                stop: function (sound) {
                    soundManager.stop(sound.id);
                },

                destroy: function (sound) {
                    soundManager.destroySound(sound.id);
                }
            }
        }]);