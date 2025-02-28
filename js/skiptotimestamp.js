var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var STT = {
	settings: STTSettings,
	media: undefined,
	skipTo: undefined,
	isHTML5: false,
	isYoutube: false,

	doHTML5Skip: function() {
		STT.media.removeEventListener('canplaythrough', STT.doHTML5Skip);
		STT.media.currentTime = STT.skipTo;
		STT.media.play();
	},

	doYoutubeSkip: function() {
		STT.media.seekTo(STT.skipTo);
		STT.media.playVideo();
	}

};

STTSkipTo = function(time) {
	var 	audio 		= document.getElementsByTagName('audio'),
		video 		= document.getElementsByTagName('video'),
		iframe      	= document.getElementsByTagName('iframe'),
		timeArray 	= time.split(':').reverse(),
		seconds 	= parseInt(timeArray[0]),
		minutes   	= timeArray.length > 1 ? parseInt(timeArray[1]) : 0,
		hours	 	= timeArray.length > 2 ? parseInt(timeArray[2]) : 0;

	STT.skipTo = seconds + (minutes * 60) + (hours * 3600);

	if (STT.media) {
		STT.doSkip();
		return;
	}
	
	// We don't have a YT player so try to find an audio or video player

	if ((parseInt(STT.settings.link_audio) && audio.length) ||
		(parseInt(STT.settings.link_video) && video.length))
	{
		STT.doSkip = STT.doHTML5Skip;

		if (parseInt(STT.settings.link_audio) && audio.length) {
			STT.media = audio[0];
		} else {
			STT.media = video[0];
		}

		var playbackRate = STT.media.playbackRate;
		STT.media.addEventListener('canplaythrough', STT.doHTML5Skip);
		STT.media.load();
		STT.media.playbackRate = playbackRate;
		STT.media.play();
		return;
	}

	console.log('Skip to Timestamp: No media player found!');
	return;
}

// YT API calls this when loaded. This initializes player.
function onYouTubeIframeAPIReady() {
        iframe = document.getElementsByTagName('iframe');

        for (var i = 0; i < iframe.length; i++) {
                if (iframe[i].src.search('youtube') !== -1) {
                        // Set up the JS interface
                        STT.doSkip = STT.doYoutubeSkip;

                        iframe[i].id = 'stt-youtube-player';
                        STT.media = new YT.Player('stt-youtube-player', {
                                events: {
                                        'onReady': STT.doYoutubeSkip
                                }
                        });
                        return;
                }
        }
}

// Listen to all clicks on the document
document.addEventListener('click', function (event) {
	var elem = event.target;
	// If the event target doesn't match bail
	if (!elem.hasAttribute('data-stt-time')) {
		return;
	}
	var time = elem.getAttribute('data-stt-time');
	STTSkipTo(time);
}, false);
