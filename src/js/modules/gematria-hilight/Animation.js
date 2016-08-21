var GEMATRIA_HILIGHT = (function(exports) {
  var filter;
  var ticker;
  var currentGematria;

  var isPaused = false;
  var speedLimit = 5.0;
  var speedCount = 0.0;
  var colorChange = true;



  function Start() {
    filter = exports.filter;


    currentGematria = exports.minGematria;
    GEMATRIA_HILIGHT.Controls.SetGematria(exports.minGematria, colorChange);

    ticker = new PIXI.ticker.Ticker();
    ticker.add(onTickEvent);
    ticker.start();
  }

  function onTickEvent( deltaTime ) {

    if(isPaused) {
      return;
    }
    speedCount += deltaTime;
    if(speedCount > speedLimit) {
      speedCount = 0;
      if(++currentGematria > exports.maxGematria) {
        currentGematria = exports.minGematria;
      }
      GEMATRIA_HILIGHT.Controls.SetGematria(currentGematria, colorChange);
    }

	}


    exports.Animation = {
      Start: Start,
      TogglePause: function() {
        isPaused = !isPaused;
      },

      ToggleColorLock: function() {
        colorChange = !colorChange;
      },

      IsColorChange: function() {
        return colorChange
      },

      Faster: function() {
        speedLimit -= 1.0;
        if(speedLimit < 0) {
          speedLimit = 0;
        }
      },
      Slower: function() {
        speedLimit += 1.0;
        if(speedLimit > 100) {
          speedLimit = 100;
        }
      },
    }
      return exports;
}(GEMATRIA_HILIGHT || {}));
