var SOUND_BUFFER = (function(exports) {
    var gematriaMode = false;

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

    function playTarget(targetSet) {
        var maxVal = -1;
        var minVal = -1;
        var vals = [];


        for(var i = 0; i < targetSet.length; i++) {
            var val;

            if(gematriaMode) {
                val = TXP.Utils.Gematria.CountData(targetSet[i]);
            } else {
                val = TXP.Utils.Gematria.CountData(targetSet[i], {skipGematria: true});
            }

            vals.push(val);
            if(maxVal == -1 || val > maxVal) {
               maxVal = val;
            }
            if(minVal == -1 || val <  minVal) {
                minVal = val;
            }
        };


        RawAudioInstrument.PlayAudio({
        maxVal: maxVal,
        minVal: minVal,
        vals: vals}
        );


    }

    function allReady() {

        $("#gematriaMode").on('click', function() {
            gematriaMode = !gematriaMode;
            if(gematriaMode) {
                $("#gematriaMode").addClass('selected');
            } else {
                $("#gematriaMode").removeClass('selected');
            }
            RawAudioInstrument.StopAudio();
        });

        RawAudioInstrument.Setup();

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
        button.onclick = RawAudioInstrument.StopAudio;
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
