TXP = (function(exports) {
    function CountHebArray(data, opts) {
        var ret = 0;
        if(opts === undefined) {
            opts = {};
        }
        for(var i = 0; i < data.length; i++) {
            ret += CountHebLetter(data[i], opts);
        }

        return ret;
    }

    function CountHebLetter(data, opts) {

        if(opts === undefined) {
            opts = {};
        }

        var hVal = data;
        if(opts.sofit !== true) {
            return TXP.Utils.TextSubstitution.GEMATRIA_ABSOLUTE[hVal];
        } else {
            return TXP.Utils.TextSubstitution.GEMATRIA_ABSOLUTE_SOFIT[hVal];
        }

        return 0;
    }

    exports.Utils.Gematria = {

      CountData: function(data, opts) {
          if(data.constructor === Array) {
              return CountHebArray(data, opts);
          } else {
              return CountHebLetter(data, opts);
          }
      },

        CountHebLetter: CountHebLetter,
      CountHebArray: CountHebArray
    }

    return exports;

}(TXP || {
    Utils: {},
    Shaders: {},
    Interactions: {},
    TanachData: {}
}));
