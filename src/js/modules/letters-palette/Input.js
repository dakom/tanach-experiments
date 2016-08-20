var LETTERS_PALETTE = (function(exports) {
  var filter;
  var chosenLetter = 0;
  var maxLetter;


  function updateChosenLetter() {
    if(chosenLetter > 27) {
      chosenLetter = 0;
    } else if(chosenLetter < 0) {
      chosenLetter = 27;
    }

    console.log("CHOSEN LETTER: " + TXP.Utils.TextSubstitution.TEXT_HEBREW[chosenLetter]);

    for(var i = 0; i < maxLetter; i++) {
      if(chosenLetter == 0 || i == chosenLetter) {
        filter.aPalette[i] = 1.0;
      } else {
        filter.aPalette[i] = 0.0;
      }
    }
  }
  function Start() {
    filter = exports.filter;
    maxLetter = TXP.Utils.TextSubstitution.TEXT_HEBREW.length;

    window.addEventListener("keydown", function(key) {
        var keyCode = key.keyCode;
        
        switch(keyCode) {
          case 32: //space
            LETTERS_PALETTE.Animation.TogglePause();
            break;
          case 38: //up
            chosenLetter++;
            updateChosenLetter();
            break;
          case 40: //down
            chosenLetter--;
            updateChosenLetter();
            break;

          case 49: //1
            filter.substitution = 0.0; // regular
            break;

          case 50: //1
            filter.substitution = 1.0; // atbash
            break;

          case 51: //1
            filter.substitution = 2.0; // albam
            break;

          default:
            break;
        }
    });
  }

  exports.Input = {
    Start: Start
  }
      return exports;
}(LETTERS_PALETTE || {}));
