var NaturalAudioInstrument = (function(exports) {

    var requireButton = false;
    var updateIntervalId = null;
    var musicData;
    var musicIndex;
    var instrument;
    var status;
    var startTiming;
    var lastTiming;

    var notes;
    var speedVal;
    var durationVal;
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
        $("#speed").hide();
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
            var slowestSpeed = 2000;
            var interval = slowestSpeed - (speedVal * slowestSpeed);
            var nextTiming = (lastTiming + interval);

            var musicInfo = musicData[musicIndex];
            if(nextTiming < currentTiming) {
                playSound(musicInfo);
                musicIndex++;
                lastTiming = currentTiming;
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
        htmlText += "<br/>";
        htmlText += "Note " + musicInfo.note + ((musicInfo.octave+1).toString());

        status.innerHTML = htmlText;

        var longestDuration = 2;
        var duration = (durationVal * longestDuration);


        //console.log(musicInfo);
        instrument.play(musicInfo.note, musicInfo.octave, duration);
    }

    function PlayAudio(config){
        var channels = 2;  // Stereo

        StopAudio();

        musicData = [];
        var timing = 0;


        for(var i = 0; i < config.vals.length; i++) {


            var val = config.vals[i].num;
            var text = config.vals[i].text;
            var noteInfo = notes[Math.round(normalizeToScale(val, config.minVal, config.maxVal, 0, notes.length-1))];

            musicInfo = {
                val: val,
                text: text,
                note: noteInfo.note,
                octave: noteInfo.octave

            };

            if(i < 3) {
                //console.log(musicInfo);
            }
            musicData.push(musicInfo);

        };

        musicIndex = 0;
        lastTiming = 0;
        startTiming = new Date().getTime();

        if(config.autoPlayMode === true) {
            updateIntervalId = setInterval(update, 1000 / 44100);
            $("#playNextSound").hide();
            $("#speed").show();
        } else {
            $("#playNextSound").show();
            $("#speed").hide();
        }
    }

    exports.StopAudio = StopAudio;
    exports.PlayAudio = PlayAudio;
    exports.PlayNextSound = PlayNextSound;
    exports.SetSpeed = function(_speedVal) {
        speedVal = _speedVal;
        console.log("Speed changed to " + speedVal);
    }
    exports.SetDuration = function(_durationVal) {
        durationVal = _durationVal;
        console.log("Duration changed to " + durationVal);
    }
    exports.Setup = function() {
        status = document.getElementById('status');
        instrument = Synth.createInstrument('piano');

        var coreNotes = ['A','A#','B','C','C#','D','D#','E','F','F#','G','G#'];

        notes = [];

        for(var octave = 0; octave < 8; octave++) {
            for(var i = 0; i < coreNotes.length; i++) {
                notes.push({
                    note: coreNotes[i],
                    octave: octave
                });
                if(octave == 7 && i == 3) {
                    break;
                }
            }

        }

        notes.push({
            note: coreNotes[i],
            octave: octave
        });

        for(var i = 0; i < notes.length; i++) {
            console.log(notes[i].note + " octave " + notes[i].octave);
        }

    }

    return exports;
}(NaturalAudioInstrument || {}));
