var GEMATRIA_HILIGHT = (function(exports) {

    var GematriaFilter = function(initGematria) {

        PIXI.Filter.call(this, TXP.Shaders.GetVertexCode('default'), TXP.Shaders.GetFragmentCode('gematria-hilight'),
        {
            gematriaHigh: {
                value: 0.0
            },
            gematriaLow: {
                value: 0.0
            },
            hilightColor: {
              value: [1.0, 1.0, 0.0, 1.0]
            }
          }
        );
    }

  GematriaFilter.prototype = Object.create(PIXI.Filter.prototype);
    GematriaFilter.prototype.constructor = GematriaFilter;
    Object.defineProperties(GematriaFilter.prototype, {
        gematria: {
            get: function() {
                var highVal = ((this.uniforms.gematriaHigh * 0xFF) << 8 & 0xFF);
                var lowVal = ((this.uniforms.gematriaLow * 0xFF) & 0xFF);
                return (highVal + lowVal);
            },
            set: function(value) {
                this.uniforms.gematriaHigh = (value >> 8 & 0xFF) / 0xFF;
                this.uniforms.gematriaLow = (value & 0xFF) / 0xFF;
            }
        },
        hilightColor: {
            get: function() {
                return this.uniforms.hilightColor;
            },
            set: function(value) {
                this.uniforms.hilightColor = value;
            }
        }
    });

    exports.GematriaFilter = GematriaFilter;

    return exports;

}(GEMATRIA_HILIGHT || {}));
