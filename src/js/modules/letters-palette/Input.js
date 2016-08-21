var LETTERS_PALETTE = (function(exports) {
    var filter;
    var chosenLetter = 0;
    var maxLetter;


    function updateChosenLetter() {
        if (chosenLetter > 27) {
            chosenLetter = 0;
        } else if (chosenLetter < 0) {
            chosenLetter = 27;
        }

        console.log("CHOSEN LETTER: " + TXP.Utils.TextSubstitution.TEXT_HEBREW[chosenLetter]);

        for (var i = 0; i < maxLetter; i++) {
            if (chosenLetter == 0 || i == chosenLetter) {
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
            console.log(keyCode);
            switch (keyCode) {
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

                case 70: //f
                    exports.sprite.scale.x *= -1; //flip sprite horizontal
                    break;

                default:
                    break;
            }
        });

        exports.sprite.interactive = true;
        TXP.Interactions.TouchEvent.addTouchStartListener(exports.sprite, function(obj, info) {
          var point = info.data.getLocalPosition(obj.parent);
          if(exports.sprite.scale.x == -1) {
            point.x = exports.sprite.width - point.x;
          }

          var offset = ((point.y-1) * exports.sprite.width) + point.x;

          var letterInfos = TXP.TanachData.Books.GetLetterInfos();

          console.log("point: " + point.x + "," + point.y + " offset: " + offset);
          var info = letterInfos[offset];
          msg = "";
          msg += TXP.TanachData.SeparateBooks.niceNames[info.book];

          msg += "\nVerse " + info.pasuk;
          msg += "\nWord " + info.word;
          msg += "\nLetter " + info.letter;
          alert(msg);
        });


    }

    exports.Input = {
        Start: Start
    }
    return exports;
}(LETTERS_PALETTE || {}));
