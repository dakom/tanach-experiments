var GEMATRIA_HILIGHT = (function(exports) {
  var filter;
  var ticker;
  var currentGematria;
var isRewind = false;
  var isPaused = false;
  var speedLimit;
  var speedCount = 0.0;
  var maxSpeedRange = 50;


  function Start() {
    filter = exports.filter;
    SetSpeed(.5);

    currentGematria = exports.minGematria;
    GEMATRIA_HILIGHT.Controls.SetGematria(exports.minGematria);

    ticker = new PIXI.ticker.Ticker();
    ticker.add(onTickEvent);
    ticker.start();
  }

  function SetSpeed(speedPerc) {
    speedLimit = maxSpeedRange - (speedPerc * maxSpeedRange);
  }

  function onTickEvent( deltaTime ) {

    if(isPaused) {
      return;
    }
    speedCount += deltaTime;
    if(speedCount > speedLimit) {
      speedCount = 0;
      if (isRewind) {
        if(--currentGematria < exports.minGematria) {
          currentGematria = exports.maxGematria;
        }
      } else {
        if(++currentGematria > exports.maxGematria) {
          currentGematria = exports.minGematria;
        }
      }

      GEMATRIA_HILIGHT.Controls.SetGematria(currentGematria);
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
}(GEMATRIA_HILIGHT || {}));
