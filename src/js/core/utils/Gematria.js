TXP = (function(exports) {
    exports.Utils.Gematria = {
      CountHebArray: function(data, opts) {
        var ret = 0;
        if(opts === undefined) {
          opts = {};
        }
        for(var i = 0; i < data.length; i++) {
          var hVal = data[i];
          var gVal
          if(opts.sofit !== true) {
            gVal = TXP.Utils.TextSubstitution.GEMATRIA_ABSOLUTE[hVal];
          } else {
            gVal = TXP.Utils.TextSubstitution.GEMATRIA_ABSOLUTE_SOFIT[hVal];
          }
          ret += gVal;
        }

        return ret;
      }
    }

    return exports;

}(TXP || {
    Utils: {},
    Shaders: {},
    Interactions: {},
    TanachData: {}
}));
