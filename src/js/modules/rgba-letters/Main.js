var RGBA_LETTERS = (function(exports) {

    function booksReady() {
      lettersTexture = RGBA_LETTERS.GetLettersTexture(TXP.canvasWidth);


      //create a graphic object to hold the filter, set it to white.
      var graphics = new PIXI.Graphics();
      graphics.beginFill(0xFFFFFF);
      graphics.drawRect(0, 0, lettersTexture.width, lettersTexture.height);
      graphics.endFill();

      graphics.filters = [new RGBA_LETTERS.LettersPaletteFilter(lettersTexture, [
        {x: 1.0, y: 1.0, z: 1.0, w: 1.0}
      ])];
      //show it!
      TXP.stage.addChild(graphics);

    }

    exports.Start = function(configOptions) {


        exports.configOptions = configOptions;
        TXP.Init(configOptions.canvasWidth, configOptions.canvasHeight, configOptions.bgColor);

        TXP.Books.Load({
          onComplete: booksReady
        });

    }

    return exports;
}(RGBA_LETTERS || {}));
