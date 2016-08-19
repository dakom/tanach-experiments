var RGBA_LETTERS = (function(exports) {
  var LettersFilter = function(lTexture) {
      var vertexShader = $("#default-vertex-shader").text();
      var fragmentShader = $("#default-fragment-shader").text();
      PIXI.Filter.call(this, vertexShader, fragmentShader, {
          lSampler: {
              type: 'sampler2D',
              value: lTexture
          }
      });

  }

  LettersFilter.prototype = Object.create(PIXI.Filter.prototype);
  LettersFilter.prototype.constructor = LettersFilter;
  Object.defineProperties(LettersFilter.prototype, {

      lTexture: {
          get: function() {
              return this.uniforms.lSampler;
          },
          set: function(value) {
              this.uniforms.lSampler = value;
          }
      },
  });

  exports.LettersFilter = LettersFilter;
    return exports;
}(RGBA_LETTERS || {}));
