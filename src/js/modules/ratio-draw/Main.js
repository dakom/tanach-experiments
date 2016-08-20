var RATIO_DRAW = (function(exports) {

  function allReady() {
    //RATIO_DRAW.DrawAlphaImage();
    var data = TXP.TanachData.Books.GetFlattened({
      benchMark: true,
      //gematriaPerWord: true,
      gematriaPerLetter: true,
      //bookEndIndex: 5,
    });

    RATIO_DRAW.DrawGematriaImage(data);
  }

    exports.Start = function(configOptions) {

        exports.configOptions = configOptions;
        TXP.Init(window.innerWidth, window.innerHeight, configOptions.bgColor);

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
}(RATIO_DRAW || {}));
