// 1. Init the player button on the page, binding player button events.
// 2.Render wave data, binding wave events:2.1 Bind click event on each line of wave data(jump) 2.2 Bind click event to all wave(play/pause). 2.3 bind havor event on each line of wave data to highlight one line.
(function ($) {
	"use strict";
    $.player = function (sound) {
        var id = sound.id;
        var waveData = sound.waveData;
        var url = sound.url;
        var title = sound.title;
        var owner = sound.owner;
        var poster = sound.poster;
        var duration = sound.duration;

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
            jQuery("<div/>", {
                id: 'sound_' + id
            }).appendTo('#sound_streams');

            jQuery("<div/>", {
                id: 'sound_art_' + id,
                class: 'sound_art'
            }).appendTo('#sound_' + id);

            jQuery("<div/>", {
                id: 'sound_player_' + id,
                class: 'sound_player'
            }).appendTo('#sound_' + id);

            jQuery("<div/>", {
                id: 'sound_cover_' + id,
                class: ''
            }).appendTo('#sound_art' + id);

            jQuery("<div/>", {
                id: 'sound_player_header_' + id,
                class: 'sound_player_header'
            }).appendTo('#sound_player_' + id);

            jQuery("<div/>", {
                id: 'sound_player_body_' + id,
                class: 'sound_player_body'
            }).appendTo('#sound_player_' + id);

            jQuery("<div/>", {
                id: 'sound_player_footer_' + id,
                class: ''
            }).appendTo('#sound_player_' + id);
        }

        function renderCover()
        {
            jQuery("<div/>", {
                id: 'sound_cover_ul_' + id,
                class: 'poster_img'
            }).appendTo('#sound_art_' + id);

            jQuery("<a href='#' ><img  src=" + poster + "></a>").appendTo('#sound_cover_ul_' + id);
        }

        function renderHeader()
        {
            renderPlayer();
            renderSoundSummary();
            renderSoundActionsInHead();
        }

        function renderBody()
        {
            renderWave();
            renderCommentBox();
        }

        function renderFooter()
        {
             renderSoundActionsInFoot();
             renderSoundSocialData();
        }

        function renderPlayer()
        {
            jQuery("<div class='sound_player_control'><i id='sound_player_button_"+ id +"' class='icon-play sound_player_button'></i></div>"
             ).appendTo('#sound_player_header_' + id);

            $('#sound_player_button_' + id).soundPlayer().setup({
               id: id,
               url: url,
               duration: duration
            });

            $('#sound_player_button_' + id).click(function(){
                $('#sound_player_button_' + id).soundPlayer().toggle({
                    id: id
                });
                $('#sound_player_button_' + id).toggleClass('icon-play icon-pause');
            });

            $('#sound_player_button_' + id).hover(function() {
                $(this).css('cursor','pointer');
            });
        }

        function renderSoundSummary()
        {
            jQuery("<div/>", {
                id: 'sound_summary_' + id
            }).appendTo('#sound_player_header_' + id);
            jQuery("<div/>", {
                id: 'sound_owner_' + id
            }).appendTo('#sound_summary_' + id);
            jQuery("<a class='sound_owner'>"+ owner.alias + "</a>", {
                href: owner.route
            }).appendTo('#sound_owner_' + id);
            jQuery("<div/>", {
                id: 'sound_title_' + id
            }).appendTo('#sound_summary_' + id);
            jQuery("<a class='sound_title'>"+ title.alias + "</a>", {
                href: title.route
            }).appendTo('#sound_title_' + id);
        }

        function renderSoundActionsInHead()
        {
             // No actions in default player..
        }

        function renderSoundActionsInFoot()
        {

        }

        function renderWave()
        {
            jQuery("<div/>", {
                id: 'sound_wave_' + sound.id,
                class: 'sound_player_wave'
            }).appendTo('#sound_player_body_' + sound.id);
            var wave = $('sound_wave_' + sound.id).soundWave({});
             wave.render(
                {
                    id: id,
                    waveData: waveData,
                    duration: duration
                }
            );
        }

        function renderCommentBox()
        {

        }

        function renderSoundSocialData()
        {

        }
    };
})(jQuery);