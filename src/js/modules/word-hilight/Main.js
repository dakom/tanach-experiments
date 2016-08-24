var WORD_HILIGHT = (function(exports) {
    function allReady() {
      exports.allLetters = TXP.TanachData.Books.GetAllLetters();
      exports.allWords = TXP.TanachData.Books.GetAllWords();


      TXP.Init(window.innerWidth,WORD_HILIGHT.GetTextureHeight(window.innerWidth), WORD_HILIGHT.configOptions.bgColor);
      wordsTexture = WORD_HILIGHT.GetWordsTexture(TXP.canvasWidth, TXP.canvasHeight);

      exports.sprite = new PIXI.Sprite(wordsTexture);
      exports.sprite.anchor.x = 0.5;
      exports.sprite.anchor.y = 0.5;
      exports.sprite.x = exports.sprite.width/2;
      exports.sprite.y = exports.sprite.height/2;
      exports.sprite.scale.x *= -1; //flip horizontal... right to left I guess

      exports.filter = new TXP.Shaders.MatchValueFilter();
      exports.sprite.filters = [exports.filter];

      TXP.stage.addChild(exports.sprite);


      WORD_HILIGHT.Animation.Start();
      WORD_HILIGHT.Controls.Start();
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
          fragment: ['default', 'value-match']
        }, {
          onComplete: function() {
            if(!--loadingGateLocked) {
              allReady();
            }

          }
        });

    }

    return exports;
}(WORD_HILIGHT || {}));
