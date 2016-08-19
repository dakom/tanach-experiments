var RATIO_DRAW = (function(exports) {

    function booksReady() {
      //RATIO_DRAW.DrawAlphaImage();
      var data = TXP.Books.GetFlattened({
        benchMark: true,
        //gematriaPerWord: true,
        gematriaPerLetter: true,
        //bookEndIndex: 5,
      });

      RATIO_DRAW.DrawGematriaImage(data);
    }

    exports.Start = function(configOptions) {


        exports.configOptions = configOptions;
        TXP.Init(configOptions.canvasWidth, configOptions.canvasHeight, configOptions.bgColor);

        TXP.Books.Load({
          onComplete: booksReady
        });

    }

    return exports;
}(RATIO_DRAW || {}));
