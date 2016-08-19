var RGBA_LETTERS = (function(exports) {
  var LettersPaletteFilter = function(lTexture, initPalettes) {
      var vertexShader = $("#default-vertex-shader").text();
      var fragmentShader = $("#letters-palette-fragment-shader").text();
      PIXI.Filter.call(this, vertexShader, fragmentShader, {
          lSampler: {
              type: 'sampler2D',
              value: lTexture
          },
          palette: {
            type: 'v3v',
            value: initPalettes
          }
      });

  }

  LettersPaletteFilter.prototype = Object.create(PIXI.Filter.prototype);
  LettersPaletteFilter.prototype.constructor = LettersPaletteFilter;
  Object.defineProperties(LettersPaletteFilter.prototype, {

      lTexture: {
          get: function() {
              return this.uniforms.lSampler;
          },
          set: function(value) {
              this.uniforms.lSampler = value;
          }
      },

      lPalettes: {
          get: function() {
              return this.uniforms.palette;
          },
          set: function(value) {
              this.uniforms.palette = value;
          }
      },
  });

  exports.LettersPaletteFilter = LettersPaletteFilter;
    return exports;
}(RGBA_LETTERS || {}));
