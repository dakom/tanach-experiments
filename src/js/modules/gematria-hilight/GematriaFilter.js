var GEMATRIA_HILIGHT = (function(exports) {

    var GematriaFilter = function(initGematria, sofit) {

        PIXI.Filter.call(this, TXP.Shaders.GetVertexCode('default'), TXP.Shaders.GetFragmentCode('gematria-hilight'),
        {
            sofit: {
                value: sofit
            },
            gematria1: {
                value: 0.0
            },
            gematria2: {
                value: 0.0
            }
          }
        );

        this.gematria = initGematria;
        this.sofit = sofit;
    }

  GematriaFilter.prototype = Object.create(PIXI.Filter.prototype);
    GematriaFilter.prototype.constructor = GematriaFilter;
    Object.defineProperties(GematriaFilter.prototype, {
        gematria: {
            get: function() {
                //this.uniforms.gematria
                var gem1 = 0;
                var gem2 = 0;
                var combined = 0;
                return combined;
            },
            set: function(value) {
                this.uniforms.gematria1 = 0.0;
                this.uniforms.gematria2 = 0.0;
            }
        },
        sofit: {
            get: function() {
                return this.uniforms.sofit;
            },
            set: function(value) {
                this.uniforms.sofit = value;
            }
        }
    });

    exports.GematriaFilter = GematriaFilter;

    return exports;

}(GEMATRIA_HILIGHT || {}));
