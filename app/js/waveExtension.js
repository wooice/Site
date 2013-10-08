(function ($) {
    $.waveFormExtension = function (options) {
        var duration = options.duration;
        var soundId = options.id;
        var comments =  options.comments;
        var commentLenth = 15;

        this.drawComments = function () {
            var canvas = document.getElementById("sound_wave_canvas_"+soundId);
            var context = canvas.getContext("2d");
            var waveWidth = parseInt(canvas.width, 10);
            var waveHeight = parseInt(canvas.height, 10);

            $.each(comments, function(index, comment){
                var owner = new Image();
                var x = (comment.pointAt * waveWidth)/(duration/1000);
                var y = waveHeight*0.7;
                owner.src = comment.owner.profile.avatorUrl;
                owner.onload = function(){
                    context.drawImage(owner, x, y, commentLenth, commentLenth);
                }
            });

            $(canvas).data("comments", comments);
        }
    };
})(jQuery);