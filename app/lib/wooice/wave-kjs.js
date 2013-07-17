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

                var background = new Kinetic.Rect({
                    x: 0,
                    y: 0,
                    width: stage.getWidth(),
                    height: stage.getHeight(),
                    fill: 'gray',
                    stroke: 'gray',
                    strokeWidth: 1,
                    opacity: 0.0
                });
                background.on('mouseenter', function(){
                    $('#sound_wave_'+sound.id).css('cursor','pointer');
                    $.each(layer.get('.lines'), function(index, line){
                        line.setOpacity(1);
                    });
                    layer.draw();
                });
                background.on('mouseleave', function(){
                    $.each(layer.get('.lines'), function(index, line){
                        line.setOpacity(0.8);
                    });
                    layer.draw();
                });
                layer.add(background);

                var widthPerLine = stage.getWidth()/sound.waveData.length;
                var mainLinePerctg = 0.7, shadowPerctg = 0.3;
                $.each(sound.waveData, function(index, data)
                {
                    var mainLine = new Kinetic.Line({
                        id: 'mainLine_'+ index,
                        name: 'lines',
                        points: [index * widthPerLine, stage.getHeight()*mainLinePerctg*(1-data), index * widthPerLine, stage.getHeight()*mainLinePerctg],
                        stroke: '#242424',
                        strokeWidth: widthPerLine,
                        lineJoin: 'round',
                        lineCap: 'round',
                        opacity: 0.8
                    });
                    mainLine.on('click', function(evt){
                           alert('d');
                    });
                    var shadowLine = new Kinetic.Line({
                        id: 'shadowLine_'+ index,
                        name: 'shadows',
                        points: [index * widthPerLine, stage.getHeight()*mainLinePerctg, index * widthPerLine, stage.getHeight()*(mainLinePerctg+data*shadowPerctg)],
                        stroke: '#9E9E9E',
                        strokeWidth: widthPerLine,
                        lineJoin: 'round',
                        opacity: 0.8
                    });
                    shadowLine.on('click', function(){
                        alert('d');
                    });
                    layer.add(mainLine);
                    layer.add(shadowLine);
                });
                stage.add(layer);
                $('#sound_wave_'+sound.id).data('stage', stage);
                $('#sound_wave_'+sound.id).data('rendered', true)
            }
        });

        $.extend(this, {
            play : function(sound)
            {
                if($('#sound_wave_'+sound.id).data('isPlaying'))
                {
                    return ;
                }
                $('#sound_wave_'+sound.id).data('isPlaying', true);
                var soundToPlay = soundData.soundList[sound.id];
                var misiSecPerLine = soundToPlay.duration/soundToPlay.waveData.length;

                if (soundToPlay.worker == null)
                {
                    soundToPlay.worker =new Worker("./lib/wooice/waveForm.js");
                    soundToPlay.worker.postMessage({
                       action: 'init',
                       soundId: sound.id,
                        misiSecPerLine: misiSecPerLine
                    });
                }

                soundToPlay.worker.postMessage({
                    action: 'play'
                });

                soundToPlay.worker.onmessage = function (event)
                {
                     if (event.data.action == 'move')
                     {
                         move({
                             id: event.data.id
                         });
                     }
                }

                function move(sound)
                {
                    var soundToPlay = soundData.soundList[sound.id];
                    var point = soundToPlay.currentWavePoint;
                    point = (point)? point: 0;

                    if (point >= soundToPlay.waveData.length)
                    {
                         return ;
                    }
                    var stage = $('#sound_wave_'+sound.id).data('stage');
                    var layer = stage.get('#wave-form')[0];
                    var mainLine = layer.get('#mainLine_'+point)[0];
                    mainLine.setStroke('#00B2EE');
                    var shadowLine = layer.get('#shadowLine_'+point)[0];
                    shadowLine.setStroke('#A4D3EE');
                    layer.draw();
                    soundToPlay.currentWavePoint = ++point;
                }
            }


        });

        $.extend(this, {
            move : function(sound)
            {
                var soundToPlay = soundData.soundList[sound.id];
                var point = soundToPlay.currentWavePoint;
                point = (point)? point: 0;
                var stage = $('#sound_wave_'+sound.id).data('stage');
                var layer = stage.get('#wave-form')[0];
                var mainLine = layer.get('#mainLine_'+point)[0];
                mainLine.setStroke('#00B2EE');
                var shadowLine = layer.get('#shadowLine_'+point)[0];
                shadowLine.setStroke('#A4D3EE');
                layer.draw();
                soundToPlay.currentWavePoint = point++;
            }
        });

        $.extend(this, {
            pause : function(sound)
            {
                $('#sound_wave_'+sound.id).data('isPlaying', false);
                var soundToPause = soundData.soundList[sound.id];
                soundToPause.worker.postMessage({
                    action: 'pause'
                });
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
            $('body').bind('onPlay', $.proxy(function(event, sound)
            {
                this.play(sound);
            },this));
            $('body').bind('onOneMove', $.proxy(function(event, sound)
            {
                this.move(sound);
            },this));
            $('body').bind('onPause', $.proxy(function(event,sound)
            {
                this.pause(sound);
            },this));
        }

        $.proxy(setupListeners,this)();
        var soundData = init();
        $('body').data('soundWave', this);
        return this;
    }
})(jQuery);