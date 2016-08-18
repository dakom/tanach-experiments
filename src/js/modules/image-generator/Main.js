var IMAGE_GENERATOR = (function(exports) {

    function booksReady() {
      //IMAGE_GENERATOR.DrawAlphaImage();
      var data = TXP.Books.GetFlattened({
        benchMark: true,
        //gematriaPerWord: true,
        gematriaPerLetter: true,
        //bookEndIndex: 5,
      });

      IMAGE_GENERATOR.DrawGematriaImage(data);
    }

    exports.Start = function(configOptions) {


        exports.configOptions = configOptions;
        TXP.Init(configOptions.canvasWidth, configOptions.canvasHeight, configOptions.bgColor);

        TXP.Books.Load({
          onComplete: booksReady
        });

    }

    return exports;
}(IMAGE_GENERATOR || {}));
