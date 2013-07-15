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

                jQuery("<canvas/>", {
                    id: 'sound_wave_canvas_' + sound.id,
                    width: $('#sound_wave_'+sound.id).width(),
                    height: $('#sound_wave_'+sound.id).height()
                }).appendTo('#sound_wave_' + sound.id);

                var stage = new createjs.Stage('sound_wave_canvas_'+sound.id);
                sound =  soundData.soundList[sound.id];

                var widthPerLine = stage.canvas.width/sound.waveData.length;
                console.log(widthPerLine);
                var mainLinePerctg = 0.7, shadowPerctg = 0.3;
                $.each(sound.waveData, function(index, data)
                {
                    var mainLine = new createjs.Shape();
                    mainLine.graphics.beginFill("#242424").drawRect(
                        index * widthPerLine,
                        stage.canvas.height * mainLinePerctg * (1-data),
                        widthPerLine,
                        stage.canvas.height*mainLinePerctg*data
                    );
                    stage.addChild(mainLine);

                    var shadowLine = new createjs.Shape();
                    shadowLine.graphics.beginFill("#242424").drawRect(
                        index * widthPerLine,
                        stage.canvas.height * mainLinePerctg,
                        widthPerLine,
                        stage.canvas.height*mainLinePerctg + stage.canvas.height*shadowPerctg* data
                    );
                    stage.addChild(shadowLine);
                });
                stage.update();
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
                    soundToPlay.worker =new Worker("./lib/wooice/wavePlayer.js");
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