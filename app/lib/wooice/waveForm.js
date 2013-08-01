(function ($) {
    $.waveForm = function (options) {
        var soundId = options.soundId;
        var canvas =  options.canvas;
        var waveWidth =  parseInt(canvas.width, 10);
        var waveHeight =  parseInt(canvas.height, 10);
        var waveData =  interpolateArray(options.waveData, waveWidth);

        var defaultUpperColor = '#404040';
        var defaultLowerColor = '#9E9E9E';
        var loadedUpperColor = '#262626';
        var loadedUpperDeeperColor = '#191919';
        var loadedLowerColor = '#9E9E9E';
        var playedUpperColor = '#00B2EE';
        var playedLowerColor = '#A4D3EE';
        var playedUpperDeeper = '#008AEE';
        var playedUpperPoint = '#0077EE';
        var context = canvas.getContext("2d");
        var soundDuration =  options.soundDuration;
        var soundPosition =  options.soundPosition;
        var soundBytesloaded = options.soundBytesloaded;
        var soundBytesTotal = options.soundBytesTotal;
        var pointPosition = -1;
        var mainLinePerctg = 0.7;
        var shadowPerctg = 0.3;
        var playStatus = 0; //0: stop. 1: playing
        var currentPlayingPosition = -1;
        var onHover = 0;

        this.redraw = function()
        {
            redrawWave();
        }

        this.setSoundPosition = function (position)
        {
            soundPosition = position;
            currentPlayingPosition = Math.ceil(waveData.length * (soundPosition/soundDuration));
        }

        this.setSoundBytesloaded = function(bytesloaded)
        {
            soundBytesloaded = bytesloaded;
        }

        this.setSoundBytesTotal = function (bytesTotal)
        {
            soundBytesTotal = bytesTotal;
        }

        this.play = function ()
        {
            playStatus = 1;
            $('#sound_wave_'+soundId).css('cursor','default');
        }

        this.stop = function ()
        {
            playStatus = 0;
            $('#sound_wave_'+soundId).css('cursor','pointer');
        }

        function redrawWave()
        {
            context.fillStyle = "transparent";
            context.clearRect(0, 0, waveWidth, waveHeight);
            context.fillRect(0, 0, waveWidth, waveHeight);
            var widthPerLine = waveWidth / waveData.length;

            $.each(waveData, function(index, data)
            {
                context.fillStyle = getColor(index, index/waveWidth, 'upper');
                context.clearRect(index * widthPerLine, waveHeight*mainLinePerctg*(1-data),  widthPerLine, waveHeight*mainLinePerctg*data);
                context.fillRect(index * widthPerLine, waveHeight*mainLinePerctg*(1-data), widthPerLine, waveHeight*mainLinePerctg*data);

                context.fillStyle = getColor(index,index/waveWidth, 'lower');
                context.clearRect(index * widthPerLine, waveHeight*mainLinePerctg, widthPerLine, waveHeight*shadowPerctg*data);
                context.fillRect(index * widthPerLine, waveHeight*mainLinePerctg, widthPerLine, waveHeight*shadowPerctg*data);
            });
        }

        function interpolateArray(data, fitCount)
        {
             var newData = [];
             var springFactor =  new Number((data.length - 1) / (fitCount - 1));
             newData[0] = data[0];
            var i = 1;

            while(i < fitCount - 1)
            {
                var tmp = i * springFactor;
                var before = new Number(Math.floor(tmp)).toFixed();
                var after = new Number(Math.ceil(tmp)).toFixed();
                var atPoint = tmp - before;
                newData[i] = linearInterpolate(data[before], data[after], atPoint);
                i++;
            }
            newData[fitCount - 1] = data[data.length - 1];
            return newData;
        }

        function  linearInterpolate(before, after, atPoint)
        {
              return before + (after - before) * atPoint;
        }

        function getColor(index, x, y)
        {
            if (playStatus && index == pointPosition && y == 'upper')
            {
                 return playedUpperPoint;
            }

            if (x < soundPosition/soundDuration)
            {
                return y == 'upper'?  (!playStatus&&onHover)?playedUpperDeeper:playedUpperColor: playedLowerColor;
            }
            if (x < soundBytesloaded/soundBytesTotal)
            {
                return y == 'upper'?  (!playStatus&&onHover)?loadedUpperDeeperColor:loadedUpperColor: loadedLowerColor;
            }
            return   y == 'upper'?  (!playStatus&&onHover)?loadedUpperColor:defaultUpperColor: defaultLowerColor;
        }

        canvas.addEventListener('mousemove', onMouseMove);

        function onMouseMove(evt)
        {
            var layerX = evt.layerX;
            var layerY = evt.layerY;
            var widthPerLine = waveWidth / waveData.length;
            var index = Math.floor(layerX);
            var prePosition = pointPosition;

            if (layerY > waveHeight*mainLinePerctg*(1-waveData[index]) && layerY <= waveHeight*mainLinePerctg)
            {
                //If current point is on a upper line, change position and change color of the line.
                pointPosition = index;

                //set new point to played color
                context.fillStyle = getColor(index,index/waveWidth, 'upper');
                context.clearRect(index * widthPerLine, waveHeight*mainLinePerctg*(1-waveData[index]),  widthPerLine, waveHeight*mainLinePerctg*waveData[index]);
                context.fillRect(index * widthPerLine, waveHeight*mainLinePerctg*(1-waveData[index]), widthPerLine, waveHeight*mainLinePerctg*waveData[index]);
            }
            else
            {
                // If point leaves upper lines, mark it.
                pointPosition = -1;
            }

            //set previous point to the color it should be
            context.fillStyle = getColor(prePosition,prePosition/waveWidth, 'upper');
            context.clearRect(prePosition * widthPerLine, waveHeight*mainLinePerctg*(1-waveData[prePosition]),  widthPerLine, waveHeight*mainLinePerctg*waveData[prePosition]);
            context.fillRect(prePosition * widthPerLine, waveHeight*mainLinePerctg*(1-waveData[prePosition]), widthPerLine, waveHeight*mainLinePerctg*waveData[prePosition]);
        }

        canvas.addEventListener('click', onClick);

        function  onClick(evt)
        {
            if (playStatus == 0)
            {
                $('body').trigger('onToggle', {
                    id: soundId
                });
            }
            else
            {
                var from = soundDuration * (evt.layerX/waveWidth);
                $('body').trigger('onJump', {
                    id: soundId,
                    from: from
                });
            }
        }

        canvas.addEventListener('mouseover', onMouseOver);
        function  onMouseOver(evt)
        {
             onHover = true;
             redrawWave();
        }

        canvas.addEventListener('mouseout', onMouseOut);

        function  onMouseOut(evt)
        {
             onHover = false;
             redrawWave();
        }

        $('#sound_wave_'+soundId).css('cursor','pointer');
    };
 })(jQuery);