(function ($) {
    $.stream = function(options)
       {
            var path="http://localhost:8080/commonService";
            var currentPage = 0;
            var soundsPerPage = 15;

            this.load = function(user)
            {
                var request = $.ajax(
                    {
                        type: 'GET',
                        url:  path + "/sound/streams/" + user,
                        headers: { "Accept" : "application/json" }
                    }
                );
                request.done(function(msg) {
                    var results = msg;
                    $.each(results, function(index, soundRecord) {
                        var player = new $.player({
                            id: index+1,
                            waveData: soundRecord.sound.soundData.wave[0],
                            url: soundRecord.sound.soundData.url,
                            poster: soundRecord.sound.profile.poster.url,
                            title: {alias: soundRecord.sound.profile.name, route:'#'},
                            owner: {alias: soundRecord.owner.profile.alias, route:'#'},
                            duration: soundRecord.sound.soundData.duration*1000
                        });
                        player.renderSound();
                    });
                });
                request.fail(function(jqXHR, textStatus) {
                    alert( "Request failed: " + textStatus);
                });
            }
       };
})(jQuery);