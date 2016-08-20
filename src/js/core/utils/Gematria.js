TXP = (function(exports) {
    exports.Utils.Gematria = {
      CountHebArray: function(data, opts) {
        var ret = 0;

        for(var i = 0; i < data.length; i++) {
          var hVal = data[i];
          var gVal = TXP.Utils.TextSubstitution.GEMATRIA_ABSOLUTE[hVal];
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
