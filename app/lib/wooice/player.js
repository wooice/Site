(function ($) {
    $.fn.soundPlayer = function(options)
    {
        if ($('body').data('singleton')) {
            return $('body').data('singleton');
        }

        function init()
        {
            var settings;
            var soundData = {};
            settings = $.extend(
                {
                    'swfUrl': '../soundmanager/swf/',
                    'preferFlash': false,
                    'volume': 50,
                    'multiShot': false
                },
                options
            );
            soundData.settings = settings;
            //init sound list, which will cache sounds
            soundData.soundList = [];
            soundData.currentSound = null;

            return soundData;
        }

        function play(sound)
        {
            soundManager.play(sound.id,
                {
                    onfinish: function()
                    {
                        soundManager._writeDebug('Sound play finished. '+this.id);
                    },
                    onstop: function() {
                        soundManager._writeDebug('sound stopped at position ' + this.position);
                    }
                }
            );
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
                    var soundStream = soundManager.createSound({
                        id         : playOption.id,
                        url        : playOption.url,
                        autoLoad  : playOption.autoLoad,
                        autoPlay  : playOption.autoPlay,
                        stream     : playOption.stream,
                        multiShot :playOption.multiShot,

                        onload:  function()
                        {
                            soundManager._writeDebug(this.id + ' loaded.');
                        },
                        onplay: function() {
                            if (soundData.currentSound.id != this.id)
                            {
                                soundManager.pause(soundData.currentSound.id);
                            }

                            soundData.currentSound = soundData.soundList[this.id];
                            soundManager._writeDebug('Starting sound: '+this.id);
                            $.trigger('onPlay');
                        },
                        whileloading: function() {
                            soundManager._writeDebug(this.id + ': loading ' + this.bytesLoaded + ' / ' + this.bytesTotal);
                        },
                        onplay: function() {
                            soundManager._writeDebug('Starting sound: '+this.id);
                            $.trigger('onPlay');
                        }
                    });

                    this.play(playOption);
                    var soundObj = {
                        id : playOption.id,
                        soundStream :  soundStream
                    };
                    soundData.soundList[soundObj.id] = soundObj;
                    soundData.currentSound.pause();
                    soundData.currentSound = soundObj;
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
                if (soundData.currentSound && soundData.currentSound.id == sound.id) {
                    soundToJump = soundData.currentSound;
                }
                else {
                    soundToJump = soundData.soundList[sound.id];
                    soundData.currentSound.pause();
                }
                soundToJump.stop();
                soundToJump.setPosition(sound.from);
                this.play(sound);
                $.trigger('onJump');
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

        var soundData = init();
        $('body').data('singleton', this);
        return this;
    }
})(jQuery);