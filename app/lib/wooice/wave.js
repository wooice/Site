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
            render: function (newSound) {
                if (!soundData.soundList[newSound.id]) {
                    soundData.soundList[newSound.id] = sound;
                }

                var canvas = document.getElementById("sound_wave_canvas_" + newSound.id);
                canvas.width = $('#sound_wave_' + newSound.id).width();
                canvas.height = $('#sound_wave_' + newSound.id).height();
                var sound = null;

                if (newSound.hasCache)
                {
                    sound = soundData.soundList[newSound.id];
                    sound.waveForm.updateCanvas(canvas);
                    sound.waveForm.updateCommentable(newSound.commentable);
                    sound.waveForm.updateColor(newSound.color);
                }
                else
                {
                    sound = $.extend(newSound);
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
                }

                sound.waveForm.redraw();
            }
        });

        $.extend(this, {
            loadFromCache: function (sound) {
                return soundData.soundList[sound.id];
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