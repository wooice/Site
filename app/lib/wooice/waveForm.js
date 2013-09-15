(function ($) {
    $.waveForm = function (options) {
        var soundId = options.soundId;
        var canvas = options.canvas;
        var waveWidth = parseInt(canvas.width, 10);
        var waveHeight = parseInt(canvas.height, 10);
        var waveData = interpolateArray(options.waveData, waveWidth);

        var defaultUpperColor = '#4f4f4f';
        var defaultLowerColor = '#9E9E9E';
        var loadedUpperColor = '#2f2f2f';
        var loadedUpperDeeperColor = '#1f1f1f';
        var loadedLowerColor = '#9E9E9E';
        var playedUpperColor = '#00B2EE';
        var playedLowerColor = '#A4D3EE';
        var playedUpperDeeper = '#008AEE';
        var playedUpperPoint = '#0077EE';
        var context = canvas.getContext("2d");
        var soundDuration = options.soundDuration;
        var soundPosition = options.soundPosition;
        var soundBytesloaded = options.soundBytesloaded;
        var soundBytesTotal = options.soundBytesTotal;
        var pointUpperPosition = -1;
        var pointLowerPosition = -1;
        var mainLinePerctg = 0.7;
        var shadowPerctg = 0.3;
        var playStatus = 0; //0: stop. 1: playing
        var currentPlayingPosition = -1;
        var onHover = 0;

        this.redraw = function () {
            redrawWave();
        }

        this.setSoundPosition = function (position) {
            soundPosition = position;
            currentPlayingPosition = Math.ceil(waveData.length * (soundPosition / soundDuration));
        }

        this.setSoundBytesloaded = function (bytesloaded) {
            soundBytesloaded = bytesloaded;
        }

        this.setSoundBytesTotal = function (bytesTotal) {
            soundBytesTotal = bytesTotal;
        }

        this.play = function () {
            playStatus = 1;
            $('#sound_wave_' + soundId).css('cursor', 'default');
        }

        this.stop = function () {
            playStatus = 0;
            $('#sound_wave_' + soundId).css('cursor', 'pointer');
        }

        function redrawWave() {
            context.fillStyle = "transparent";
            context.clearRect(0, 0, waveWidth, waveHeight);
            context.fillRect(0, 0, waveWidth, waveHeight);
            var widthPerLine = waveWidth / waveData.length;

            $.each(waveData, function (index, data) {
                context.fillStyle = getColor(index, index / waveWidth, 'upper');
                context.clearRect(index * widthPerLine, waveHeight * mainLinePerctg * (1 - data), widthPerLine, waveHeight * mainLinePerctg * data);
                context.fillRect(index * widthPerLine, waveHeight * mainLinePerctg * (1 - data), widthPerLine, waveHeight * mainLinePerctg * data);

                context.fillStyle = getColor(index, index / waveWidth, 'lower');
                context.clearRect(index * widthPerLine, waveHeight * mainLinePerctg, widthPerLine, waveHeight * shadowPerctg * data);
                context.fillRect(index * widthPerLine, waveHeight * mainLinePerctg, widthPerLine, waveHeight * shadowPerctg * data);
            });
        }

        function interpolateArray(data, fitCount) {
            var newData = [];
            var springFactor = new Number((data.length - 1) / (fitCount - 1));
            newData[0] = data[0];
            var i = 1;

            while (i < fitCount - 1) {
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

        function linearInterpolate(before, after, atPoint) {
            return before + (after - before) * atPoint;
        }

        function getColor(index, x, y) {
            if (playStatus && ((index == pointUpperPosition && y == 'upper') || (index == pointLowerPosition && y == 'lower'))) {
                return playedUpperPoint;
            }

            if (x < soundPosition / soundDuration) {
                return y == 'upper' ? (!playStatus && onHover) ? playedUpperDeeper : playedUpperColor : playedLowerColor;
            }
            if (x < soundBytesloaded / soundBytesTotal) {
                return y == 'upper' ? (!playStatus && onHover) ? loadedUpperDeeperColor : loadedUpperColor : loadedLowerColor;
            }
            return   y == 'upper' ? ((!playStatus && onHover) ? loadedUpperColor : defaultUpperColor) : (defaultLowerColor);
        }

        canvas.addEventListener('mousemove', onMouseMove);

        function onMouseMove(evt) {
            var layerX = evt.layerX;
            var layerY = evt.layerY;
            var widthPerLine = waveWidth / waveData.length;
            var index = Math.floor(layerX);
            var preUpperPosition = pointUpperPosition;
            var preLowerPosition = pointLowerPosition;

            if (layerY > waveHeight * mainLinePerctg * (1 - waveData[index]) && layerY <= waveHeight * mainLinePerctg) {
                //If current point is on a upper line, change position and change color of the line.
                pointUpperPosition = index;

                //set new point to played color
                context.fillStyle = getColor(index, index / waveWidth, 'upper');
                context.clearRect(index * widthPerLine, waveHeight * mainLinePerctg * (1 - waveData[index]), widthPerLine, waveHeight * mainLinePerctg * waveData[index]);
                context.fillRect(index * widthPerLine, waveHeight * mainLinePerctg * (1 - waveData[index]), widthPerLine, waveHeight * mainLinePerctg * waveData[index]);
            }
            else {
                // If point leaves upper lines, mark it.
                pointUpperPosition = -1;
            }

            if (layerY > waveHeight * mainLinePerctg && layerY < waveHeight * (mainLinePerctg + shadowPerctg * waveData[index])) {
                pointLowerPosition = index;

                //set new point to played color
                context.fillStyle = getColor(index, index / waveWidth, 'lower');
                context.clearRect(index * widthPerLine, waveHeight * mainLinePerctg, widthPerLine, waveHeight * shadowPerctg * waveData[index]);
                context.fillRect(index * widthPerLine, waveHeight * mainLinePerctg, widthPerLine, waveHeight * shadowPerctg * waveData[index]);
            }
            else {
                pointLowerPosition = -1;
            }

            if (-1 != preUpperPosition) {
                //set previous upper point to the color it should be
                context.fillStyle = getColor(preUpperPosition, preUpperPosition / waveWidth, 'upper');
                context.clearRect(preUpperPosition * widthPerLine, waveHeight * mainLinePerctg * (1 - waveData[preUpperPosition]), widthPerLine, waveHeight * mainLinePerctg * waveData[preUpperPosition]);
                context.fillRect(preUpperPosition * widthPerLine, waveHeight * mainLinePerctg * (1 - waveData[preUpperPosition]), widthPerLine, waveHeight * mainLinePerctg * waveData[preUpperPosition]);
            }

            if (-1 != preLowerPosition) {
                //set previous lower point to the color it should be
                context.fillStyle = getColor(preLowerPosition, preLowerPosition / waveWidth, 'lower');
                context.clearRect(preLowerPosition * widthPerLine, waveHeight * mainLinePerctg, widthPerLine, waveHeight * shadowPerctg * waveData[preLowerPosition]);
                context.fillRect(preLowerPosition * widthPerLine, waveHeight * mainLinePerctg, widthPerLine, waveHeight * shadowPerctg * waveData[preLowerPosition]);
            }
        }

        canvas.addEventListener('click', onClick);

        function onClick(evt) {
            if (playStatus == 0) {
                $(window).trigger('onToggle', {
                    id: soundId
                });
            }
            else {
                var layerX = evt.layerX;
                var index = Math.floor(layerX);
                var layerY = evt.layerY;

                if (layerY > waveHeight * mainLinePerctg * (1 - waveData[index]) && layerY <= waveHeight * mainLinePerctg) {
                    var from = soundDuration * (evt.layerX / waveWidth);
                    $(window).trigger('onJump', {
                        id: soundId,
                        from: from
                    });
                }

                if (layerY > waveHeight * mainLinePerctg && layerY <= waveHeight * (mainLinePerctg + shadowPerctg * waveData[index])) {
                    var curSec = (soundDuration * (index / waveWidth));
                    var curMin = Math.floor(curSec / (60 * 1000));
                    var leftSec = ((curSec - curMin * 60 * 1000) / 1000).toFixed(2);

                    $('#sound_commentbox_' + soundId).show();
                    $('#sound_commentbox_input_' + soundId).attr("placeholder", ("您将留言在 " + ((curMin>0)?("@ " + curMin + "分 "):"") + leftSec + "秒 ..."));
                    $('#sound_comment_point_' + soundId).val((curSec / 1000).toFixed(2));
                }
            }
        }

        canvas.addEventListener('mouseover', onMouseOver);
        function onMouseOver(evt) {
            onHover = true;
            redrawWave();
        }

        canvas.addEventListener('mouseout', onMouseOut);

        function onMouseOut(evt) {
            onHover = false;
            redrawWave();
        }

        $('#sound_wave_' + soundId).css('cursor', 'pointer');
    };
})(jQuery);