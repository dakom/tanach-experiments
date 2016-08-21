var GEMATRIA_HILIGHT = (function(exports) {
  function SetGematria(val) {
      exports.filter.gematria = val;
      if(GEMATRIA_HILIGHT.Animation.IsColorChange() == true) {
        exports.filter.hilightColor = [
          Math.random(),
          Math.random(),
          Math.random(),
          1.0
        ];


      }

      $("#gemval").text(val);
  }

  function Start() {
    window.addEventListener("keydown", function(key) {
        var keyCode = key.keyCode;

        switch(keyCode) {
          case 32: //space
            GEMATRIA_HILIGHT.Animation.TogglePause();
            break;
            case 38: //up
            GEMATRIA_HILIGHT.Animation.Faster();
              break;
            case 40: //down
              GEMATRIA_HILIGHT.Animation.Slower();
              break;
              case 70: //f
                exports.sprite.scale.x *= -1; //flip sprite horizontal
                break;
            case 67:
              GEMATRIA_HILIGHT.Animation.ToggleColorLock();
              break;
          default:
            break;
        }
    });

      $("#ingem").on('input', function() {
        var val = $("#ingem").val();

        if(val >= exports.minGematria && val <= exports.maxGematria) {
          SetGematria(val);
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

  exports.Controls = {
    SetGematria: SetGematria,
    Start: Start
  }
  return exports;
}(GEMATRIA_HILIGHT || {}));
