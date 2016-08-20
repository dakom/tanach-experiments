var LETTERS_PALETTE = (function(exports) {
  var filter;
  var ticker;
  var speeds = [];
  var maxLetter;
  var isPaused = false;

  function newSpeed() {
    return Math.random() * .1;
  }

  function Start() {
    filter = exports.filter;
    maxLetter = TXP.Utils.TextSubstitution.TEXT_HEBREW.length;
    for(i = 0; i < maxLetter; i++) {
      speeds[i] = {
        r: newSpeed(),
        g: newSpeed(),
        b: newSpeed()
      }
    }

    ticker = new PIXI.ticker.Ticker();
    ticker.add(onTickEvent);
    ticker.start();
  }

  function onTickEvent( deltaTime ) {
    if(isPaused) {
      return;
    }
    var rPalette = filter.rPalette;
    var gPalette = filter.gPalette;
    var bPalette = filter.bPalette;

    for(i = 0; i < maxLetter; i++) {
        var rVal = rPalette[i];
        var gVal = gPalette[i];
        var bVal = bPalette[i];

        rVal += deltaTime * speeds[i].r;
        gVal += deltaTime * speeds[i].g;
        bVal += deltaTime * speeds[i].b;

        if(rVal > 1.0) {
          rVal = 1.0;
          speeds[i].r = newSpeed() * -1;
        } else if(rVal < 0.01) {
          rVal = 0.01;
          speeds[i].r = newSpeed();
        }

        if(gVal > 1.0) {
          gVal = 1.0;
          speeds[i].g = newSpeed() * -1;
        } else if(gVal < 0.01) {
          gVal = 0.01;
          speeds[i].g = newSpeed();
        }

        if(bVal > 1.0) {
          bVal = 1.0;
          speeds[i].b = newSpeed() * -1;
        } else if(bVal < 0.01) {
          bVal = 0.01;
          speeds[i].b = newSpeed();
        }



        rPalette[i] = rVal;
        gPalette[i] = gVal;
        bPalette[i] = bVal;
    }

	}


    exports.Animation = {
      Start: Start,
      TogglePause: function() {
        isPaused = !isPaused;
      }
    }
      return exports;
}(LETTERS_PALETTE || {}));
