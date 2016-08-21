var LETTERS_PALETTE = (function(exports) {
    function GetTextureHeight(textureWidth) {
      return Math.ceil(exports.allLetters.length / textureWidth);
    }

    exports.GetTextureHeight = GetTextureHeight;

    exports.GetLettersTexture = function(textureWidth) {
        var letters = exports.allLetters;
        var textureHeight = GetTextureHeight(textureWidth);

        var canvas = document.createElement('canvas');
        canvas.width = textureWidth;
        canvas.height = textureHeight;

        var ctx = (function() {
            if (canvas.getContext == undefined) {
                return G_vmlCanvasManager.initElement(canvas).getContext("2d");
            }
            return canvas.getContext('2d')
        }());

        var imgData = ctx.createImageData(canvas.width, canvas.height);


        for (var letterIndex = 0, imageIndex = 0; letterIndex < letters.length; letterIndex++) {

            var letter = letters[letterIndex];
            var atBash = TXP.Utils.TextSubstitution.SUBSTITUTION_ATBASH[letter];
            var alBam = TXP.Utils.TextSubstitution.SUBSTITUTION_ALBAM[letter];
            imgData.data[imageIndex++] = letter; //red channel - baseLetter
            imgData.data[imageIndex++] = atBash; //green channel - letter as atBash
            imgData.data[imageIndex++] = alBam; //blue channel - letter as alBam
            imgData.data[imageIndex++] = 0xFF; //can't pass data here, seems to be pre-multipled or something

            if(letterIndex < 20) {
              //console.log(letter + " " + atBash + " " + alBam);
            }
        }
        ctx.putImageData(imgData, 0, 0);
        return PIXI.Texture.fromCanvas(canvas);
    }
    return exports;
}(LETTERS_PALETTE || {}));
