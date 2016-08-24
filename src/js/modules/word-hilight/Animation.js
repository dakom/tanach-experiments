var WORD_HILIGHT = (function(exports) {
    var filter;
    var ticker;
    var currentWordIndex;
    var isRewind = false;
    var isPaused = false;
    var speedLimit;
    var speedCount = 0.0;
    var maxSpeedRange = 50;


    function Start() {
        filter = exports.filter;
        SetSpeed(.5);

        currentWordIndex = 0;
        SetWordViaIndex(currentWordIndex);

        ticker = new PIXI.ticker.Ticker();
        ticker.add(onTickEvent);
        ticker.start();
    }

    function SetWordViaIndex(index) {

        WORD_HILIGHT.Controls.SetWord(TXP.Utils.TextSubstitution.GetTextFromArray(WORD_HILIGHT.allWords[index]));
    }

    function SetSpeed(speedPerc) {
        speedLimit = maxSpeedRange - (speedPerc * maxSpeedRange);
    }

    function onTickEvent(deltaTime) {

        if (isPaused) {
            return;
        }
        speedCount += deltaTime;
        if (speedCount > speedLimit) {
            speedCount = 0;
            if (isRewind) {
                if (--currentWordIndex < 0) {
                    currentWordIndex = WORD_HILIGHT.allWords.length - 1;
                }
            } else {
                if (++currentWordIndex > WORD_HILIGHT.allWords.length) {
                    currentWordIndex = 0;
                }
            }
            SetWordViaIndex(currentWordIndex);
        }

    }


    exports.Animation = {
        Start: Start,
        SetSpeed: SetSpeed,
        IsPaused: function() {
            return isPaused;
        },
        TogglePause: function() {
            isPaused = !isPaused;
        },
        ToggleRewind: function() {
            isRewind = !isRewind;
        },
        IsRewind: function() {
            return isRewind;
        }

    }
    return exports;
}(WORD_HILIGHT || {}));
