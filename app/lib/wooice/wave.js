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

                var canvas = document.createElement('canvas');
                canvas.id = 'sound_wave_canvas_'+sound.id;
                canvas.width =  $('#sound_wave_'+sound.id).width();
                canvas.height =  $('#sound_wave_'+sound.id).height();
                jQuery(canvas).appendTo('#sound_wave_' + sound.id);

                sound =  soundData.soundList[sound.id];

                var waveForm = new $.waveForm({
                    canvas: canvas,
                    waveData: sound.waveData,
                    soundPosition: 0,
                    soundDuration: sound.duration,
                    soundBytesloaded: 0,
                    soundBytesTotal: 0//TODO get real bytes
                });

                waveForm.redraw();

                $('#sound_wave_'+sound.id).data('waveForm ', waveForm );
                $('#sound_wave_'+sound.id).data('rendered', true)
            }
        });

        $.extend(this, {
            move : function(sound)
            {
                var waveForm = $('#sound_wave_'+sound.id).data('waveForm ');
                waveForm.setSoundPosition(sound.soundPosition);
                waveForm.redraw();
            }
        });

        $.extend(this, {
            load : function(sound)
            {
                var waveForm = $('#sound_wave_'+sound.id).data('waveForm ');
                waveForm.setSoundBytesloaded(sound.soundBytesloaded);
                waveForm.setSoundBytesTotal(sound.bytesTotal);
                waveForm.redraw();
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
                this.move(sound);
            },this));

            $('body').bind('onLoad', $.proxy(function(event, sound)
            {
                this.load(sound);
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