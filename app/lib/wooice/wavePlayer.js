
var soundId;
var misiSecPerLine;
var timerId;
self.onmessage = function(evt)
{
    var soundInfo = evt.data;
    switch (soundInfo.action)
    {
        case 'init':
            soundId = soundInfo.soundId;
            misiSecPerLine = soundInfo.misiSecPerLine;
            break;
        case 'play':
            timerId = setInterval(run, misiSecPerLine);
            break;
        case 'pause':
            clearInterval(timerId);
            break;
        default:
            break;
    }

    function run()
    {
        postMessage({
            action: 'move',
            id: soundId
        });
    }
}

