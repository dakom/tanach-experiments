var SOUND_BUFFER = (function(exports) {

    //http://stats.stackexchange.com/questions/9478/how-to-normalize-data-to-let-each-feature-lie-between-1-1
    function normalizeToScale(value, vMin, vMax, sMin, sMax, logToConsole) {

        var standard = (value - vMin) / (vMax - vMin);
        var scaled = (standard * (sMax - sMin)) + sMin;

        if(logToConsole === true) {
            console.log(value, standard, scaled);
        }
        return scaled;
    }



    exports.PlayAudio = function() {



        var min = SOUND_BUFFER.minGematria;
        var max = SOUND_BUFFER.maxGematria;
        var gematriaValues = SOUND_BUFFER.gematriaValues;

        var samples = [];

        for(var i = 0; i < gematriaValues.length; i++) {
            var gematria = gematriaValues[i];
            samples.push(normalizeToScale(gematria, min, max, -1.0, 1.0));
        };

        //https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createBuffer
        //play audio

        // Stereo
        var channels = 2;

        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        var audioBuffer = audioCtx.createBuffer(channels, samples.length, audioCtx.sampleRate);

        for (var channel = 0; channel < channels; channel++) {
            // This gives us the actual ArrayBuffer that contains the data
            var buf = audioBuffer.getChannelData(channel);
            for (var i = 0; i < samples.length; i++) {
                buf[i] = samples[i];
            }
        }


        exports.totalDuration = samples.length / audioCtx.sampleRate;


        // Get an AudioBufferSourceNode.
        // This is the AudioNode to use when we want to play an AudioBuffer
        var audioSource = audioCtx.createBufferSource();
        // set the buffer in the AudioBufferSourceNode
        audioSource.buffer = audioBuffer;
        // connect the AudioBufferSourceNode to the
        // destination so we can hear the sound
        audioSource.connect(audioCtx.destination);
        // start the source playing
        audioSource.start();

        exports.audioCtx = audioCtx;
        exports.audioSource = audioSource;
        exports.audioBuffer = audioBuffer;
    }


    return exports;
}(SOUND_BUFFER || {}));
