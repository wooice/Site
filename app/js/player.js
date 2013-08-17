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

        this.renderSound = function () {
            renderFrame();
            renderCover();
            renderHeader();
            renderBody();
            renderFooter();
        };

        function renderFrame() {
        }

        function renderCover() {
        }

        function renderHeader() {
            renderPlayer();
            renderSoundSummary();
            renderSoundActionsInHead();
        }

        function renderBody() {
            renderWave();
            renderCommentBox();
        }

        function renderFooter() {
            renderSoundActionsInFoot();
            renderSoundSocialData();
        }

        function renderPlayer() {
        }

        function renderSoundSummary() {
        }

        function renderSoundActionsInHead() {
            // No actions in default player..
        }

        function renderSoundActionsInFoot() {

        }

        function renderWave() {
            var wave = $(window).soundWave({});
            wave.render(
                {
                    id: id,
                    waveData: waveData,
                    duration: duration
                }
            );
            waveData = null;
            sound = null;
        }

        function renderCommentBox() {

        }

        function renderSoundSocialData() {

        }
    };
})(jQuery);