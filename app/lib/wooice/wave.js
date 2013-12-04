angular.module('wooice.waver', []).
    factory('WooiceWaver', [ 'config','storage', function (config, storage) {
        function init() {
            var soundData = {};
            //init sound list, which will cache waves
            soundData.soundList = [];
            soundData.currentSound = null;

            return soundData;
        }
        var soundData = init();

        return {
            recordWaveStatus: function(){
                // when user leave the page, record the current status of the wave.
                for (var oneSound in soundData.soundList) {
                    oneSound = soundData.soundList[oneSound];
                    if (oneSound && oneSound.waveForm.getSoundPosition() != null) {
                        var storedSound = storage.get(oneSound.id + "_wave");
                        storedSound.position= oneSound.waveForm.getSoundPosition();
                        storage.set(oneSound.id + "_wave", storedSound);
                    }
                }
            },

            render: function (newSound) {
                if (!soundData.soundList[newSound.id]) {
                    soundData.soundList[newSound.id] = sound;
                }

                var canvas = document.getElementById("sound_wave_canvas_" + newSound.id);
                canvas.width = $('#sound_wave_' + newSound.id).width();
                canvas.height = $('#sound_wave_' + newSound.id).height();
                var sound = null;

                if (!newSound.position)
                {
                    var playerCache = storage.get(newSound.id + "_player");
                    if (playerCache)
                    {
                        newSound.position = playerCache.from;
                    }
                }

                if (soundData.soundList[newSound.id])
                {
                    sound = soundData.soundList[newSound.id];
                    sound.waveForm.updateCanvas(canvas, newSound.waveData);
                    sound.waveForm.updateCommentable(newSound.commentable);
                    sound.waveForm.updateColor(newSound.color);
                }
                else
                {
                    sound = newSound;
                    var waveForm = new $.waveForm({
                        id: sound.id,
                        soundId: sound.id,
                        canvas: canvas,
                        waveData: sound.waveData,
                        soundPosition: sound.position,
                        soundDuration: sound.duration,
                        soundBytesloaded: 0,
                        soundBytesTotal: 0,
                        color: sound.color,
                        commentable: sound.commentable
                    });

                    sound.waveForm = waveForm;
                    soundData.soundList[sound.id] = sound;
                }

                storage.set(sound.id + "_wave",
                    {
                        waveData: newSound.waveData,
                        position: sound.position
                    });

                delete newSound.waveData;
                sound.waveForm.redraw();
                sound.waveForm.cleanWaveData();
            },

            move: function (sound) {
                var waveForm = soundData.soundList[sound.id].waveForm;
                if (waveForm)
                {
                    waveForm.recoverWaveData(storage);
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
                    waveForm.cleanWaveData();
                    waveForm.stop();
                }
            },

            play: function (sound) {
                var waveForm = soundData.soundList[sound.id].waveForm;
                waveForm.play();
            },

            jump: function (sound) {
                var waveForm = soundData.soundList[sound.id].waveForm;
                waveForm.setSoundPosition(sound.soundPosition);
                waveForm.redraw();
            }
    }
}]);