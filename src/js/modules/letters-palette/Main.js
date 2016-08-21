var LETTERS_PALETTE = (function(exports) {
    function allReady() {
      exports.allLetters = TXP.TanachData.Books.GetAllLetters();
      exports.allWords = TXP.TanachData.Books.GetAllWords();
      
      TXP.Init(window.innerWidth,LETTERS_PALETTE.GetTextureHeight(window.innerWidth), LETTERS_PALETTE.configOptions.bgColor);
      lettersTexture = LETTERS_PALETTE.GetLettersTexture(TXP.canvasWidth);

      console.log("Created Texture " + lettersTexture.width + "x" + lettersTexture.height);
      var initialPalette = createInitialPalette();

      exports.sprite = new PIXI.Sprite(lettersTexture);
      exports.sprite.anchor.x = 0.5;
      exports.sprite.anchor.y = 0.5;
      exports.sprite.x = exports.sprite.width/2;
      exports.sprite.y = exports.sprite.height/2;
      exports.sprite.scale.x *= -1; //flip horizontal... right to left I guess
      exports.filter = new LETTERS_PALETTE.LettersFilter(initialPalette, 0.0);

      exports.sprite.filters = [exports.filter];
      TXP.stage.addChild(exports.sprite);


      LETTERS_PALETTE.Animation.Start();
      LETTERS_PALETTE.Input.Start();
    }

    function createInitialPalette() {
      var maxLetter = TXP.Utils.TextSubstitution.TEXT_HEBREW.length;
      var rPalette = [];
      var gPalette = [];
      var bPalette = [];
      var aPalette = [];

      for(var i = 0; i < maxLetter; i++) {

        rPalette[i] = Math.random();
        gPalette[i] = Math.random();
        bPalette[i] = Math.random();
        aPalette[i] = 1.0;
      }

      return {
        rPalette: rPalette,
        gPalette: gPalette,
        bPalette: bPalette,
        aPalette: aPalette,
      };
    }

    exports.Start = function(configOptions) {


        exports.configOptions = configOptions;


        var loadingGateLocked = 2;

        TXP.TanachData.Books.Load({
          onComplete: function () {

            if(!--loadingGateLocked) {
              allReady();
            }

          }
        });

        TXP.Shaders.Load({
          vertex: ['default'],
          fragment: ['default', 'letters-palette']
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
