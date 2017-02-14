var AudioInstrument = (function(exports) {

    var audioCtx = null;
    var audioSource = null;
    var audioBuffer = null;
    var updateIntervalId = null;
    var totalDuration;

    var status;

    //http://stats.stackexchange.com/questions/9478/how-to-normalize-data-to-let-each-feature-lie-between-1-1
    function normalizeToScale(value, vMin, vMax, sMin, sMax, logToConsole) {

        var standard = (value - vMin) / (vMax - vMin);
        var scaled = (standard * (sMax - sMin)) + sMin;

        if(logToConsole === true) {
            console.log(value, standard, scaled);
        }
        return scaled;
    }


     function StopAudio() {
        if(audioSource != null) {
            audioSource.stop();

        }

         if(updateIntervalId != null) {
             clearInterval(updateIntervalId);
             updateIntervalId = null;
         }

        audioCtx = null;
        audioSource = null;
        audioBuffer = null;

        status.innerHTML = "";
    }

    function updateStatus() {
        statusText = "CurrentTime: " + audioCtx.currentTime + "<br/>Total duration: " + totalDuration;
        status.innerHTML = statusText;

        if(audioCtx.currentTime > totalDuration) {
            StopAudio();
        }
    }

    function PlayAudio(config){
        var channels = 2;  // Stereo

        StopAudio();

        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioBuffer = audioCtx.createBuffer(channels, config.vals.length, audioCtx.sampleRate);
        audioSource = audioCtx.createBufferSource();

        totalDuration = config.vals.length / audioCtx.sampleRate;

        var samples = [];

        for(var i = 0; i < config.vals.length; i++) {
            var val = config.vals[i];
            samples.push(normalizeToScale(val, config.minVal, config.maxVal, -1.0, 1.0));
        };

        //https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createBuffer
        //play audio

        for (var channel = 0; channel < channels; channel++) {
            // This gives us the actual ArrayBuffer that contains the data
            var buf = audioBuffer.getChannelData(channel);
            for (var i = 0; i < samples.length; i++) {
                buf[i] = samples[i];
            }
        }

        // Get an AudioBufferSourceNode.
        // This is the AudioNode to use when we want to play an AudioBuffer

        // set the buffer in the AudioBufferSourceNode
        audioSource.buffer = audioBuffer;
        // connect the AudioBufferSourceNode to the
        // destination so we can hear the sound
        audioSource.connect(audioCtx.destination);
        // start the source playing
        audioSource.start();

        updateIntervalId = setInterval(updateStatus, 1000/audioCtx.sampleRate);
    }

    exports.StopAudio = StopAudio;
    exports.PlayAudio = PlayAudio;
    exports.Setup = function() {
        status = document.getElementById('status');
    }

    return exports;
}(AudioInstrument || {}));
