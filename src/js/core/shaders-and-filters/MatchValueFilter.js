var TXP = (function(exports) {

    var MatchValueFilter = function(initGematria) {

        PIXI.Filter.call(this, TXP.Shaders.GetVertexCode('default'), TXP.Shaders.GetFragmentCode('value-match'),
        {
            rVal: {
                value: 0.0
            },
            gVal: {
                value: 0.0
            },
            bVal: {
              value: 0.0
            },
            matchColor: {
              value: [1.0, 1.0, 1.0, 1.0]
            },
            bgColor: {
              value: [0.5, 0.5, 0.5, 1.0]
            }
          }
        );
    }

  MatchValueFilter.prototype = Object.create(PIXI.Filter.prototype);
  MatchValueFilter.prototype.constructor = MatchValueFilter;
    Object.defineProperties(MatchValueFilter.prototype, {
        numberValue: {
            get: function() {
                //get rgb values for set number... it is in range of 0.0 to 1.0
                //so need to multiply that like percentage of 0xFF per channel first
                var rVal = (((this.uniforms.rVal * 0xFF) << 16) & 0xFF);
                var gVal = (((this.uniforms.gVal * 0xFF) << 8) & 0xFF);
                var bVal = ((this.uniforms.bVal * 0xFF) & 0xFF);

                return (rVal + gVal + bVal);
            },
            set: function(value) {
                //set rgb values for number... shader expects range of 0.0 to 1.0
                //so need to divide by 0xFF as though it were percentage, e.g. to normalize in that range

                this.uniforms.rVal = ((value >> 16) & 0xFF) / 0xFF;
                this.uniforms.gVal = ((value >> 8) & 0xFF) / 0xFF;
                this.uniforms.bVal = (value & 0xFF) / 0xFF;
            }
        },
        matchColor: {
            get: function() {
                return this.uniforms.matchColor;
            },
            set: function(value) {
                this.uniforms.matchColor = value;
            }
        },
        bgColor: {
            get: function() {
                return this.uniforms.bgColor;
            },
            set: function(value) {
                this.uniforms.bgColor = value;
            }
        }
    });

    exports.Shaders.MatchValueFilter = MatchValueFilter;

    return exports;
  }(TXP || {
      Utils: {},
      Shaders: {},
      Interactions: {},
      TanachData: {}
  }));
