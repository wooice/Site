(function ($) {
    $.waveForm = function (options) {

        var canvas =  options.canvas;
        var waveData =  options.waveData;
        var defaultUpperColor = '#242424';
        var defaultLowerColor = '#9E9E9E';
        var loadedUpperColor = '';
        var loadedLowerColor = '';
        var playedUpperColor = '#00B2EE';
        var playedLowerColor = '#A4D3EE';
        var context = canvas.getContext("2d");
        var soundDuration =  options.soundDuration;
        var soundPosition =  options.soundPosition;
        var soundBytesloaded = options.soundBytesloaded;
        var soundBytesTotal = options.soundBytesTotal;

        this.redraw = function()
        {
            context.fillStyle = "white";
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);
            var widthPerLine = context.canvas.width / waveData.length;
            var mainLinePerctg = 0.7, shadowPerctg = 0.3;

            $.each(waveData, function(index, data)
            {
                context.fillStyle = getColor(index/context.canvas.width, 'upper');
                context.clearRect(index * widthPerLine, context.canvas.height*mainLinePerctg*(1-data), index * widthPerLine, context.canvas.height*mainLinePerctg);
                context.fillRect(index * widthPerLine, context.canvas.height*mainLinePerctg*(1-data), index * widthPerLine, context.canvas.height*mainLinePerctg);

                context.fillStyle = getColor(index/context.canvas.width, 'lower');
                context.clearRect(index * widthPerLine, context.canvas.height*mainLinePerctg, index * widthPerLine, context.canvas.height*mainLinePerctg + context.canvas.height*shadowPerctg*data);
                context.fillRect(index * widthPerLine, context.canvas.height*mainLinePerctg, index * widthPerLine, context.canvas.height*mainLinePerctg + context.canvas.height*shadowPerctg*data);
            });
        }

        function getColor(x, y)
        {
             if (x < soundPosition/soundDuration)
             {
                return y == 'upper'?  playedUpperColor: playedLowerColor;
             }
            if (x < soundBytesloaded/soundBytesTotal)
            {
                return y == 'upper'?  loadedUpperColor: loadedLowerColor;
            }
            return   y == 'upper'?  defaultUpperColor: defaultLowerColor;
        }

        this.setSoundPosition = function (soundPosition)
        {
            this.soundPosition = soundPosition;
        }

        this.setSoundBytesloaded = function(soundBytesloaded)
        {
            this.soundBytesloaded = soundBytesloaded;
        }

        this.setSoundBytesTotal = function (soundBytesTotal)
        {
            this.soundBytesTotal = soundBytesTotal;
        }
    };
 })(jQuery);