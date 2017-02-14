var NaturalAudioInstrument = (function(exports) {

    var requireButton = false;
    var updateIntervalId = null;
    var musicData;
    var musicIndex;
    var instrument;
    var status;
    var startTiming;

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
        $("#playNextSound").hide();

        if(updateIntervalId != null) {
            clearInterval(updateIntervalId);
            updateIntervalId = null;
        }

        status.innerHTML = "";
    }

    function update() {



        if(musicIndex > musicData.length) {
            StopAudio();
        } else {
            currentTiming = new Date().getTime() - startTiming;


            var musicInfo = musicData[musicIndex];
            if(musicInfo.timing < currentTiming) {
                playSound(musicInfo);
                musicIndex++;
            }

        }
    }

    function PlayNextSound() {

        if(musicIndex < musicData.length) {
            playSound(musicData[musicIndex]);
            musicIndex++;
        }
    }

    function playSound(musicInfo) {
        var htmlText = '';
        htmlText += "Current index: " + musicIndex;
        htmlText += "<br/>";
        htmlText += musicInfo.text;

        status.innerHTML = htmlText;

        //console.log(musicInfo);
        instrument.play(musicInfo.note, musicInfo.octave, musicInfo.duration);
    }

    function PlayAudio(config){
        var channels = 2;  // Stereo

        StopAudio();

        musicData = [];
        var timing = 0;

        for(var i = 0; i < config.vals.length; i++) {
            var notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

            var val = config.vals[i].num;
            var text = config.vals[i].text;
            var note = notes[Math.round(normalizeToScale(val, config.minVal, config.maxVal, 0, notes.length-1))];
            var octave = Math.round(normalizeToScale(val, config.minVal, config.maxVal, 1, 4))
            var duration = Math.random() * 3;
            timing += Math.random() * 1000;

            musicInfo = {
                val: val,
                text: text,
                note: note,
                octave: octave,
                duration: duration,
                timing: timing,

            };

            if(i < 3) {
                //console.log(musicInfo);
            }
            musicData.push(musicInfo);

        };

        musicIndex = 0;
        startTiming = new Date().getTime();

        if(config.autoPlayMode === true) {
            updateIntervalId = setInterval(update, 1000 / 44100);
            $("#playNextSound").hide();
        } else {
            $("#playNextSound").show();
        }
    }

    exports.StopAudio = StopAudio;
    exports.PlayAudio = PlayAudio;
    exports.PlayNextSound = PlayNextSound;
    exports.Setup = function() {
        status = document.getElementById('status');
        instrument = Synth.createInstrument('piano');
    }

    return exports;
}(NaturalAudioInstrument || {}));
