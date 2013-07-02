(function ($) {
    $.fn.soundWave = function(options)
    {
        if ($('body').data('soundWave')) {
            return $('body').data('soundWave');
        }

        function init()
        {
            var soundData = {};
            //init sound list, which will cache sounds
            soundData.soundList = [];
            soundData.currentSound = null;

            return soundData;
        }

        $.extend(this, {
            addSound : function(sound)
            {
                soundData.soundList[sound.id] = sound;
            }
        });

        $.extend(this, {
            render : function(sound)
            {
                if (!soundData.soundList[sound.id])
                {
                    soundData.soundList[sound.id] = sound;
                }

                 if ($('#sound_wave_'+sound.id).data('rendered'))
                 {
                     return;
                 }

                var stage = new Kinetic.Stage({
                    container: 'sound_wave_'+sound.id,
                    width: $('#sound_wave_'+sound.id).width(),
                    height: $('#sound_wave_'+sound.id).height()
                });

                sound =  soundData.soundList[sound.id];
                var layer = new Kinetic.Layer({
                    id : 'wave-form'
                });
                var widthPerLine = stage.getWidth()/sound.waveData.length;
                var mainLinePerctg = 0.7, shadowPerctg = 0.3;
                $.each(sound.waveData, function(index, data)
                {
                    var mainLine = new Kinetic.Line({
                        name: 'lines',
                        points: [index * widthPerLine, stage.getHeight()*mainLinePerctg*(1-data), index * widthPerLine, stage.getHeight()*mainLinePerctg],
                        stroke: 'black',
                        strokeWidth: widthPerLine,
                        lineJoin: 'round',
                        lineCap: 'round'
                    });
                    var shadowLine = new Kinetic.Line({
                        name: 'shadows',
                        points: [index * widthPerLine, stage.getHeight()*mainLinePerctg, index * widthPerLine, stage.getHeight()*(mainLinePerctg+data*shadowPerctg)],
                        stroke: 'gray',
                        strokeWidth: widthPerLine,
                        lineJoin: 'round'
                    });
                    //TODO: add click event to each line(jump and play)
                    layer.add(mainLine);
                    layer.add(shadowLine);
                });
                stage.add(layer);
                $('#sound_wave-'+sound.id).data('stage', stage);
            }
        });

        $.extend(this, {
            play : function(sound)
            {
                var soundToPlay = soundData.soundList[sound.id];
                var point = soundToPlay.currentWavePoint;
                var secondPerLine = soundToPlay.duration/soundToPlay.wave.length;
                var timerId = setInterval(run, 1000*secondPerLine);
                soundToPlay.timerId = timerId;

                function run()
                {
                    var mainLinePerctg = 0.7, shadowPerctg = 0.3;
                    var stage = $('#sound_wave-'+sound.id).data('stage');
                    var layer = stage.get('#wave-form');
                    var mainLine = new Kinetic.Line({
                        points: [point * widthPerLine, stage.getWidth()*mainLinePerctg*(1-data), point * widthPerLine, stage.getWidth()*mainLinePerctg],
                        stroke: 'orange',
                        strokeWidth: widthPerLine,
                        lineJoin: 'round',
                        lineCap: 'round'
                    });
                    var shadowLine = new Kinetic.Line({
                        points: [point * widthPerLine, stage.getWidth()*mainLinePerctg, point * widthPerLine, stage.getWidth()*(mainLinePerctg+data*shadowPerctg)],
                        stroke: 'orange',
                        strokeWidth: widthPerLine,
                        lineJoin: 'round'
                    });
                    layer.add(mainLine);
                    layer.add(shadowLine);
                    soundToPlay.currentWavePoint = point++;
                }
            }
        });

        $.extend(this, {
            pause : function(sound)
            {
                var soundToPause = soundData.soundList[sound.id];
                clearInterval(soundToPause.timerId);
            }
        });

        $.extend(this, {
            jump : function(sound, toWavePoint)
            {
                var soundToJump = soundData.soundList[sound.id];

                //From current line of wave data to toWavePoint line of wave data.
                for(var point=soundToJump.currentWavePoint; point<toWavePoint; point++)
                {
                    var stage = $('#sound_wave-'+sound.id).data('stage');
                    var layer = stage.get('#wave-form');
                    var mainLine = new Kinetic.Line({
                        points: [point * widthPerLine, stage.getWidth()*0.7*(1-data), point * widthPerLine, stage.getWidth()*0.7],
                        stroke: 'red',
                        strokeWidth: widthPerLine,
                        lineJoin: 'round'
                    });
                    var shadowLine = new Kinetic.Line({
                        points: [point * widthPerLine, stage.getWidth()*0.7, point * widthPerLine, stage.getWidth()*(0.7+data*0.3 *0.3)],
                        stroke: 'orange',
                        strokeWidth: widthPerLine,
                        lineJoin: 'round'
                    });
                    layer.add(mainLine);
                    layer.add(shadowLine);
                }
                $('body').trigger('onJump',
                    {
                        id : sound.id,
                        from : 1000 * (soundToJump*soundToJump.duration/soundToJump.waveData.length)
                    }
                );
            }
        });

        function setupListeners()
        {
            $('body').bind('onPlay', function(sound)
            {
                this.play(sound);
            });
            $('body').bind('onPause', function(sound)
            {
                this.pause(sound);
            });
        }

        setupListeners();

        var soundData = init();
        $('body').data('soundWave', this);
        return this;
    }
})(jQuery);