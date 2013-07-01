// 1. Init the player button on the page, binding player button events.
// 2.Render wave data, binding wave events:2.1 Bind click event on each line of wave data(jump) 2.2 Bind click event to all wave(play/pause). 2.3 bind havor event on each line of wave data to highlight one line.
(function ($) {
    $.player = function (sound) {
        var id = sound.id;
        var waveData = sound.waveData;
        var url = sound.url;

        this.renderSound = function()
        {
            renderFrame();
            renderCover();
            renderHeader();
            renderBody();
            renderFooter();
        };

        function renderFrame()
        {
            $('<div/>', {
                id: 'sound_' + id,
                css: 'row-fluid'
            }).appendTo('#sound_streams');

            jQuery('<div/>', {
                id: 'sound_art_' + id,
                css: 'span2'
            }).appendTo('#sound_' + id);

            jQuery('<div/>', {
                id: 'sound_player_' + id,
                css: 'span10 row-fluid'
            }).appendTo('#sound_' + id);

            jQuery('<div/>', {
                id: 'sound_cover_' + id,
                css: ''
            }).appendTo('#sound_art' + id);

            jQuery('<div/>', {
                id: 'sound_player_header_' + id,
                css: ''
            }).appendTo('#sound_player_' + id);

            jQuery('<div/>', {
                id: 'sound_player_body_' + id,
                css: ''
            }).appendTo('#sound_player_' + id);

            jQuery('<div/>', {
                id: 'sound_player_footer_' + id,
                css: ''
            }).appendTo('#sound_player_' + id);
        }

        function renderCover()
        {

        };

        function renderHeader()
        {
            renderPlayer();
            renderSoundSummary();
            renderSoundActionsInHead();
        };

        function renderBody()
        {
            renderWave();
            renderCommentBox();
        };

        function renderFooter()
        {
             renderSoundActionsInFoot();
             renderSoundSocialData();
        };

        function renderPlayer()
        {
            jQuery('<i/>', {
                id: 'sound_player_button_' + id,
                css: 'icon-play'
            }).appendTo('#sound_player_header_' + id);

            $('sound_player_button_' + id).soundPlayer().setup({
               id: id,
               url: url
            });

            $('sound_player_button_' + id).click(function(){
                $('sound_player_button_' + id).soundPlayer().toggle({
                    id: id
                });
            });
        };

        function renderSoundSummary()
        {
            jQuery('<div/>', {
                id: 'sound_summary_' + id
            }).appendTo('#sound_player_header_' + id);
        };

        function renderSoundActionsInHead()
        {
             // No actions in default player..
        };

        function renderSoundActionsInFoot()
        {

        };

        function renderWave()
        {
            jQuery('<div/>', {
                id: 'sound_wave_' + sound.id
            }).appendTo('#sound_player_body_' + sound.id);
            var wave = $('sound_wave_' + sound.id).soundWave({});
             wave.render(
                {
                    id: id,
                    waveData: waveData
                }
            );
        };

        function renderCommentBox()
        {

        };

        function renderSoundSocialData()
        {

        }
    };
})(jQuery);