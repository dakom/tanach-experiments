var LETTERS_PALETTE = (function(exports) {

    function allReady() {
      lettersTexture = LETTERS_PALETTE.GetLettersTexture(TXP.canvasWidth);


      //create a graphic object to hold the filter, set it to white.
      var graphics = new PIXI.Graphics();
      graphics.beginFill(0xFFFFFF);
      graphics.drawRect(0, 0, lettersTexture.width, lettersTexture.height);
      graphics.endFill();

      graphics.filters = [new LETTERS_PALETTE.LettersFilter([
        {x: 1.0, y: 1.0, z: 1.0}
      ])];
      //show it!
      TXP.stage.addChild(graphics);

    }

    exports.Start = function(configOptions) {


        exports.configOptions = configOptions;
        TXP.Init(configOptions.canvasWidth, configOptions.canvasHeight, configOptions.bgColor);

        var loadingGateLocked = 2;

        TXP.Books.Load({
          onComplete: function () {

            if(!--loadingGateLocked) {
              allReady();
            }
            
          }
        });

        TXP.Shaders.Load({
          vertex: ['default'],
          fragment: ['default']
        }, {
          onComplete: function() {
            if(!--loadingGateLocked) {
              allReady();
            }

          }
        });

    }

    return exports;
}(LETTERS_PALETTE || {}));
