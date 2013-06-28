(function ($) {
    $.fn.wave = function(options)
    {
        if ($('body').data('singleton')) {
            return $('body').data('singleton');
        }

        function init()
        {
            var soundData = {};
            //init sound list, which will cache sounds
            c = [];
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
                 if ($('#soundWave-'+sound.id).data('rendered'))
                 {
                     return;
                 }
                var stage = new Kinetic.Stage({
                    container: 'soundWave'+sound.id,
                    width: window.innerWidth,
                    height: window.innerHeight
                });

                sound =  soundData.soundList[sound.id];
                var layer = new Kinetic.Layer({
                    id : 'wave-form'
                });
                var widthPerLine = stage.getWidth()/sound.waveData.length;

                $.each(sound.waveData, function(index, data)
                {
                    var mainLine = new Kinetic.Line({
                        points: [index * widthPerLine, stage.getWidth()*0.7*(1-data), index * widthPerLine, stage.getWidth()*0.7],
                        stroke: 'black',
                        strokeWidth: widthPerLine,
                        lineJoin: 'round'
                    });
                    var shadowLine = new Kinetic.Line({
                        points: [index * widthPerLine, stage.getWidth()*0.7, index * widthPerLine, stage.getWidth()*(0.7+data*0.3 *0.3)],
                        stroke: 'gray',
                        strokeWidth: widthPerLine,
                        lineJoin: 'round'
                    });
                    layer.add(mainLine);
                    layer.add(shadowLine);
                    stage.add(layer);
                });
                $('#soundWave-'+sound.id).data('stage', stage);
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
                    var stage = $('#soundWave-'+sound.id).data('stage');
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
                for(var point=soundToJump.currentWavePoint; point<toWavePoint; point++)
                {
                    var stage = $('#soundWave-'+sound.id).data('stage');
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
                $.trigger('onJump',
                    {
                        id : sound.id,
                        from : 1000 * (soundToJump*soundToJump.duration/soundToJump.waveData.length)
                    }
                );
            }
        });

        function setupListeners()
        {
            $.bind('onPlay', this.play(sound));
            $.bind('onPause', this.pause(sound));
        }

        setupListeners();

        var soundData = init();
        $('body').data('singleton', this);
        return this;
    }
})(jQuery);