var LETTERS_PALETTE = (function(exports) {

    var LettersFilter = function(initPalettes, substitution) {

        PIXI.Filter.call(this, TXP.Shaders.GetVertexCode('default'), TXP.Shaders.GetFragmentCode('letters-palette'), {
            rPalette: {
                value: initPalettes.rPalette
            },
            gPalette: {
                value: initPalettes.gPalette
            },
            bPalette: {
                value: initPalettes.bPalette
            },
            aPalette: {
                value: initPalettes.aPalette
            },
            substitution: {
              value: substitution
            }
        });

    }

    LettersFilter.prototype = Object.create(PIXI.Filter.prototype);
    LettersFilter.prototype.constructor = LettersFilter;
    Object.defineProperties(LettersFilter.prototype, {
        rPalette: {
            get: function() {
                return this.uniforms.rPalette;
            },
            set: function(value) {
                this.uniforms.rPalette = value;
            }
        },
        gPalette: {
            get: function() {
                return this.uniforms.gPalette;
            },
            set: function(value) {
                this.uniforms.gPalette = value;
            }
        },
        bPalette: {
            get: function() {
                return this.uniforms.bPalette;
            },
            set: function(value) {
                this.uniforms.bPalette = value;
            }
        },
        aPalette: {
            get: function() {
                return this.uniforms.aPalette;
            },
            set: function(value) {
                this.uniforms.aPalette = value;
            }
        },
        substitution: {
            get: function() {
                return this.uniforms.substitution;
            },
            set: function(value) {
                this.uniforms.substitution = value;
            }
        }
    });

    exports.LettersFilter = LettersFilter;

    return exports;

}(LETTERS_PALETTE || {}));
