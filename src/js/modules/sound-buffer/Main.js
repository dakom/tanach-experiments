var SOUND_BUFFER = (function(exports) {
    var statusIntervalId = null;

    function playWords() {


        playTarget(TXP.TanachData.Books.GetAllWords());
    }
    function playLetters() {
        playTarget(TXP.TanachData.Books.GetAllLetters());
    }

    function playLettersBreaks() {
        var words = TXP.TanachData.Books.GetAllWords();
        var letters = [];
        for(var w = 0; w < words.length; w++) {
            var word = words[w];
            for(var i = 0; i < word.length; i++) {
                letters.push(word[i]);
            }
            letters.push(0);
        }
        playTarget(letters);
    }

    function playMiluiWords() {
        var words = TXP.TanachData.Books.GetAllWords();
        var data = [];
        for(var w = 0; w < words.length; w++) {
            data.push(TXP.Utils.TextSubstitution.GetMilui(words[w]));
        }
        playTarget(data);
    }

    function playMiluiLetters() {
        var words = TXP.TanachData.Books.GetAllWords();
        var data = [];
        for(var w = 0; w < words.length; w++) {
            var word = TXP.Utils.TextSubstitution.GetMilui(words[w]);
            for(var i = 0; i < word.length; i++) {
                data.push(word[i]);
            }
        }
        playTarget(data);
    }

    function stopAudio() {
        if(exports.audioSource != null) {
            exports.audioSource.stop();

        }

        exports.audioCtx = null;
        exports.audioSource = null;
        exports.audioBuffer = null;

        if(statusIntervalId != null) {
            clearInterval(statusIntervalId);
            statusIntervalId = null;
        }

        status.innerHTML = "";
    }

    function playTarget(targetSet) {
        stopAudio();

        exports.maxGematria = -1;
        exports.minGematria = -1;
        exports.gematriaValues = [];


        for(var i = 0; i < targetSet.length; i++) {
            var gematria = TXP.Utils.Gematria.CountData(targetSet[i]);

            exports.gematriaValues.push(gematria);
            if(exports.maxGematria == -1 || gematria > exports.maxGematria) {
                exports.maxGematria = gematria;
            }
            if(exports.minGematria == -1 || gematria <  exports.minGematria) {
                exports.minGematria = gematria;
            }
        };


        SOUND_BUFFER.PlayAudio();

        var statusRate = 1000/exports.audioCtx.sampleRate;


        statusIntervalId = setInterval(updateStatus, statusRate);
    }

    function updateStatus() {
        var status = document.getElementById('status');
        statusText = exports.audioCtx.currentTime + "/" + exports.totalDuration;
        status.innerHTML = statusText;

        if(exports.audioCtx.currentTime > exports.totalDuration) {
            stopAudio();
        }
    }

    function allReady() {




        var button = document.getElementById('playLetters');
        button.onclick = playLetters;
        var button = document.getElementById('playWords');
        button.onclick = playWords;
        var button = document.getElementById('playMiluiWords');
        button.onclick = playMiluiWords;
        var button = document.getElementById('playMiluiLetters');
        button.onclick = playMiluiLetters;
        var button = document.getElementById('playLettersBreaks');
        button.onclick = playLettersBreaks;
        var button = document.getElementById('stop');
        button.onclick = stopAudio;
    }


    exports.Start = function(configOptions) {


        exports.configOptions = configOptions;


        var loadingGateLocked = 1;

        TXP.TanachData.Books.Load({
            onComplete: function () {

                if(!--loadingGateLocked) {
                    allReady();
                }

            }
        });
    }

    return exports;
}(SOUND_BUFFER || {}));
