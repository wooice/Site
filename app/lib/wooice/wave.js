(function ($) {
    $.fn.soundWave = function (options) {
        if (window.soundWave) {
            return window.soundWave;
        }

        function init() {
            var soundData = {};
            //init sound list, which will cache waves
            soundData.soundList = [];
            soundData.currentSound = null;

            return soundData;
        }

        $.extend(this, {
            cleanUp: function (sound) {
                soundData.soundList = [];
            }
        });

        $.extend(this, {
            render: function (sound) {
                if (!soundData.soundList[sound.id]) {
                    soundData.soundList[sound.id] = sound;
                }else
                {
                    if (!sound.force)
                    {
                        return;
                    }
                }

                var canvas = document.getElementById("sound_wave_canvas_" + sound.id);
                if (!sound.force && $(canvas).data("inited"))
                {
                    return ;
                }
                canvas.width = $('#sound_wave_' + sound.id).width();
                canvas.height = $('#sound_wave_' + sound.id).height();
                $(canvas).data("inited", true);

                sound = soundData.soundList[sound.id];

                var waveForm = new $.waveForm({
                    id: sound.id,
                    soundId: sound.id,
                    canvas: canvas,
                    waveData: sound.waveData,
                    soundPosition: 0,
                    soundDuration: sound.duration,
                    soundBytesloaded: 0,
                    soundBytesTotal: 0,
                    color: sound.color,
                    commentable: sound.commentable
                });

                sound.waveForm = waveForm;
                soundData.soundList[sound.id] = sound;

                waveForm.redraw();
            }
        });

        $.extend(this, {
            move: function (sound) {
                var waveForm = soundData.soundList[sound.id].waveForm;
                if (waveForm)
                {
                    waveForm.play();
                    waveForm.setSoundPosition(sound.soundPosition);
                    waveForm.redraw();
                }
            }
        });

        $.extend(this, {
            load: function (sound) {
                var waveForm = soundData.soundList[sound.id].waveForm;
                waveForm.setSoundBytesloaded(sound.soundBytesloaded);
                waveForm.setSoundBytesTotal(sound.soundBytesTotal);
                waveForm.redraw();
            }
        });

        $.extend(this, {
            stop: function (sound) {
                var waveForm = soundData.soundList[sound.id].waveForm;
                if (waveForm)
                {
                    waveForm.stop();
                }
            }
        });

        $.extend(this, {
            play: function (sound) {
                var waveForm = soundData.soundList[sound.id].waveForm;
                waveForm.play();
            }
        });

        $.extend(this, {
            jump: function (sound, toWavePoint) {
                var waveForm = soundData.soundList[sound.id].waveForm;
                waveForm.setSoundPosition(sound.soundPosition);
                waveForm.redraw();

                $(window).trigger('onJump',
                    {
                        id: sound.id,
                        from: 1000 * (soundToJump * soundToJump.duration / soundToJump.waveData.length)
                    }
                );
            }
        });

        function setupListeners() {
            $(window).bind('onPlaying', $.proxy(function (event, sound) {
                this.move(sound);
            }, this));

            $(window).bind('onLoading', $.proxy(function (event, sound) {
                this.load(sound);
            }, this));

            $(window).bind('onPlay', $.proxy(function (event, sound) {
                this.play(sound);
            }, this));

            $(window).bind('onPause', $.proxy(function (event, sound) {
                this.stop(sound);
            }, this));

            $(window).bind('onResume', $.proxy(function (event, sound) {
                this.play(sound);
            }, this));

            $(window).bind('onFinish', $.proxy(function (event, sound) {
                this.stop(sound);
            }, this));
        }

        $.proxy(setupListeners, this)();
        var soundData = init();
        window.soundWave = this;
        return this;
    }
})(jQuery);