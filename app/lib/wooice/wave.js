angular.module('wooice.waver', []).
    factory('WooiceWaver', [ 'config', function (config) {
        function init() {
            var soundData = {};
            //init sound list, which will cache waves
            soundData.soundList = [];
            soundData.currentSound = null;

            return soundData;
        }
        var soundData = init();

        return {
            cleanUp: function (sound) {
                soundData.soundList = [];
            },

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
            },

            loadFromCache: function (sound) {
                return soundData.soundList[sound.id];
            },

            move: function (sound) {
                var waveForm = soundData.soundList[sound.id].waveForm;
                if (waveForm)
                {
                    waveForm.play();
                    waveForm.setSoundPosition(sound.soundPosition);
                    waveForm.redraw();
                }
            },

            load: function (sound) {
                var waveForm = soundData.soundList[sound.id].waveForm;
                waveForm.setSoundBytesloaded(sound.soundBytesloaded);
                waveForm.setSoundBytesTotal(sound.soundBytesTotal);
                waveForm.redraw();
            },

            stop: function (sound) {
                var waveForm = soundData.soundList[sound.id].waveForm;
                if (waveForm)
                {
                    waveForm.stop();
                }
            },

            play: function (sound) {
                var waveForm = soundData.soundList[sound.id].waveForm;
                waveForm.play();
            },

            jump: function (sound, toWavePoint) {
                var waveForm = soundData.soundList[sound.id].waveForm;
                waveForm.setSoundPosition(sound.soundPosition);
                waveForm.redraw();

                $(window).trigger('onJump', {
                    id: sound.id,
                    from: 1000 * (soundToJump * soundToJump.duration / soundToJump.waveData.length)
                });
            }
    }
    }]);