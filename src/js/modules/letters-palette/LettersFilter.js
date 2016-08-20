var LETTERS_PALETTE = (function(exports) {

    var LettersFilter = function(initPalettes) {
        PIXI.Filter.call(this, TXP.Shaders.GetVertexCode('default'), TXP.Shaders.GetFragmentCode('default'), {
            palette: {
                value: initPalettes
            }
        });

    }

    LettersFilter.prototype = Object.create(PIXI.Filter.prototype);
    LettersFilter.prototype.constructor = LettersFilter;
    Object.defineProperties(LettersFilter.prototype, {
        palette: {
            get: function() {
                return this.uniforms.palette;
            },
            set: function(value) {
                this.uniforms.palette = value;
            }
        }
    });

    exports.LettersFilter = LettersFilter;

    return exports;

}(LETTERS_PALETTE || {}));
