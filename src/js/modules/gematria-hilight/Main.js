var GEMATRIA_HILIGHT = (function(exports) {
    function allReady() {
      exports.allLetters = TXP.TanachData.Books.GetAllLetters();
      exports.allWords = TXP.TanachData.Books.GetAllWords();

      TXP.Init(window.innerWidth,GEMATRIA_HILIGHT.GetTextureHeight(window.innerWidth), GEMATRIA_HILIGHT.configOptions.bgColor);
      gematriaTexture = GEMATRIA_HILIGHT.GetGematriaTexture(TXP.canvasWidth);

      console.log("Created Texture " + gematriaTexture.width + "x" + gematriaTexture.height);

      exports.sprite = new PIXI.Sprite(gematriaTexture);
      exports.sprite.anchor.x = 0.5;
      exports.sprite.anchor.y = 0.5;
      exports.sprite.x = exports.sprite.width/2;
      exports.sprite.y = exports.sprite.height/2;
      exports.sprite.scale.x *= -1; //flip horizontal... right to left I guess

      exports.filter = new GEMATRIA_HILIGHT.GematriaFilter(913.0, 0.0);
      exports.sprite.filters = [exports.filter];

      TXP.stage.addChild(exports.sprite);


      //GEMATRIA_HILIGHT.Animation.Start();
      //GEMATRIA_HILIGHT.Input.Start();
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
          fragment: ['default', 'gematria-hilight']
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
