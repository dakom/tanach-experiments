var GEMATRIA_HILIGHT = (function(exports) {
    function allReady() {
      exports.allLetters = TXP.TanachData.Books.GetAllLetters();
      exports.allWords = TXP.TanachData.Books.GetAllWords();

      exports.maxGematria = 0;
      exports.minGematria = 1640;

      for(var i = 0; i < GEMATRIA_HILIGHT.allWords.length; i++) {
        var gematria = TXP.Utils.Gematria.CountHebArray(GEMATRIA_HILIGHT.allWords[i]);
        if(gematria > exports.maxGematria) {
          exports.maxGematria = gematria;
        }
        if(gematria <  exports.minGematria) {
          exports.minGematria = gematria;
        }
      };

      TXP.Init(window.innerWidth,GEMATRIA_HILIGHT.GetTextureHeight(window.innerWidth), GEMATRIA_HILIGHT.configOptions.bgColor);
      gematriaTexture = GEMATRIA_HILIGHT.GetGematriaTexture(TXP.canvasWidth, TXP.canvasHeight);





      console.log("Created Texture " + gematriaTexture.width + "x" + gematriaTexture.height);

      exports.sprite = new PIXI.Sprite(gematriaTexture);
      exports.sprite.anchor.x = 0.5;
      exports.sprite.anchor.y = 0.5;
      exports.sprite.x = exports.sprite.width/2;
      exports.sprite.y = exports.sprite.height/2;
      exports.sprite.scale.x *= -1; //flip horizontal... right to left I guess

      exports.filter = new TXP.Shaders.MatchValueFilter();
      exports.filter.bgColor = [0.0, 0.0, 0.0, 1.0];
      exports.sprite.filters = [exports.filter];

      TXP.stage.addChild(exports.sprite);


      GEMATRIA_HILIGHT.Animation.Start();
      GEMATRIA_HILIGHT.Controls.Start();
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
}(GEMATRIA_HILIGHT || {}));
