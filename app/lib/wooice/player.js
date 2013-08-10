(function ($) {
    $.fn.soundPlayer = function(options)
    {
        if (window.soundPlayer) {
            return window.soundPlayer;
        }

        function init()
        {
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
        setup : function(sound)
        {
            soundManager.setup({
                url : soundData.settings.swfUrl,
                preferFlash :  soundData.settings.preferFlash,

                onready : function()
                {
                    var playOption = $.extend(
                        {
                            'id'        : 'defaultSoundId',
                            'url'       : '',
                            'autoLoad' :  false,
                            'autoPlay' :  false,
                            'stream'   :  true,
                            'multiShot':  false
                        },
                        sound
                    );
                    var miliSecPerMove = 1800/sound.duration;

                    var soundStream = soundManager.createSound({
                        id         : playOption.id,
                        url        : playOption.url,
                        autoLoad  : playOption.autoLoad,
                        autoPlay  : playOption.autoPlay,
                        stream     : playOption.stream,
                        multiShot : playOption.multiShot,

                        onload: function()
                        {
                            console.log(this.id + ' loaded.');
                            soundManager._writeDebug(this.id + ' loaded.');
                        },
                        onplay: function() {
                            if (soundData.currentSound != this.id)
                            {
                                var pre =  soundData.currentSound;
                                soundData.currentSound = this.id;
                                soundManager.pause(pre);
                                $('#sound_player_button_' + soundData.currentSound).removeClass('icon-pause');
                                $('#sound_player_button_' + soundData.currentSound).addClass('icon-play');
                            }

                            soundManager._writeDebug('Starting sound: '+this.id);

                            $(window).trigger('onPlay', {
                                id: this.id
                            });
                            $('#sound_player_button_' + this.id).removeClass('icon-play');
                            $('#sound_player_button_' + this.id).addClass('icon-pause');
                        },
                        whileloading: function() {
                            soundManager._writeDebug(this.id + ': loading ' + this.bytesLoaded + ' / ' + this.bytesTotal);
                            $(window).trigger('onLoading', {
                                id: this.id,
                                soundBytesloaded: this.bytesLoaded,
                                soundBytesTotal: this.bytesTotal
                            });
                        },
                        whileplaying: function() {
                            $(window).trigger('onPlaying', {
                                id: this.id,
                                soundPosition: this.position
                            });
                        },
                        onpause: function() {
                            soundManager._writeDebug('Sound paused: '+ this.id);
                            $(window).trigger('onPause', {
                                id: this.id
                            });
                            $('#sound_player_button_' + this.id).removeClass('icon-pause');
                            $('#sound_player_button_' + this.id).addClass('icon-play');
                        },
                        onresume: function() {
                            if (soundData.currentSound != this.id)
                            {
                                var pre =  soundData.currentSound;
                                soundData.currentSound = this.id;
                                soundManager.pause(pre);
                                $('#sound_player_button_' + soundData.currentSound).removeClass('icon-pause');
                                $('#sound_player_button_' + soundData.currentSound).addClass('icon-play');
                            }

                            soundManager._writeDebug('Resuming sound: '+this.id);
                            $(window).trigger('onResume', {
                                id: this.id
                            });

                            $('#sound_player_button_' + this.id).removeClass('icon-play');
                            $('#sound_player_button_' + this.id).addClass('icon-pause');
                        },
                        onfinish: function() {
                            $(window).trigger('onFinish', {
                                id: this.id
                            });
                        }
                    });

                    soundData.soundList.push(playOption.id);

                    if (playOption.autoPlay)
                    {
                        this.play(playOption);
                    }
                },

                ontimeout: function()
                {
                    soundManager._writeDebug('Sound load timeout: '+this.id);
                },

                onfinish: function()
                {
                    soundManager._writeDebug('Sound play finished. '+this.id);
                }
            });
        }
    });

        $.extend(this, {
            jump: function(sound) {
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
                        onload: function() {
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
         toggle : function(sound)
        {
            soundManager.togglePause(sound.id);
        }
        });

        $.extend(this, {
            setVolume : function(sound)
            {
                soundManager.setVolume(sound.id, sound.volume);
            }
        });

        $.extend(this, {
            stop : function(sound)
            {
                soundManager.stop(sound.id);
            }
        });

        function setupListeners()
        {
            $(window).bind('onJump', $.proxy(function(event, sound)
            {
                this.jump(sound);
            }, this));
            $(window).bind('onToggle', $.proxy(function(event, sound)
            {
                this.toggle(sound);
            }, this));
        }
        var soundData = init();
        $.proxy(setupListeners,this)();

        window.soundPlayer = this;
        return this;
    }
})(jQuery);