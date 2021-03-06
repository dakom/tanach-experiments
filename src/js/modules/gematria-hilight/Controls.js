var GEMATRIA_HILIGHT = (function(exports) {
  function SetGematria(val) {
      exports.filter.numberValue = val;

      $("#gemval").val(val);
  }

  function ResetColors() {
    exports.filter.bgColor = parseInt($("#bgColor").spectrum("get").toHex(), 16);
    exports.filter.matchColor = parseInt($("#matchColor").spectrum("get").toHex(), 16);

  }
  function Start() {
    ResetColors();

    $("#bgColor").on('move.spectrum', ResetColors);
    $("#matchColor").on('move.spectrum', ResetColors);
    $("#bgColor").on('change.spectrum', ResetColors);
    $("#matchColor").on('change.spectrum', ResetColors);

    window.addEventListener("keydown", function(key) {
        var keyCode = key.keyCode;

        switch(keyCode) {

              case 70: //f
                exports.sprite.scale.x *= -1; //flip sprite horizontal
                break;

          default:
            break;
        }
    });

      $("#speed").on('input', function() {
        GEMATRIA_HILIGHT.Animation.SetSpeed($("#speed").val()/100);
      });

      $("#rewindMode").on('click', function() {
          GEMATRIA_HILIGHT.Animation.ToggleRewind();
          if(GEMATRIA_HILIGHT.Animation.IsRewind()) {
            $("#rewindMode").addClass('selected');
          } else {
            $("#rewindMode").removeClass('selected');
          }
      });

      $("#playMode").on('click', function() {
          GEMATRIA_HILIGHT.Animation.TogglePause();
          $("#playMode").val(GEMATRIA_HILIGHT.Animation.IsPaused() ? "Play" : "Pause");
      });

      $("#gemval").on('input', function() {
        var val = $("#gemval").val();

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
    Start: Start,
    ResetColors: ResetColors,
  }
  return exports;
}(GEMATRIA_HILIGHT || {}));
