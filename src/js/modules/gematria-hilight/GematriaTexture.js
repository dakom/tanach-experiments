var GEMATRIA_HILIGHT = (function(exports) {

    function GetTextureHeight(textureWidth) {
      return Math.ceil(GEMATRIA_HILIGHT.allLetters.length / textureWidth);
    }

    exports.GetTextureHeight = GetTextureHeight;

    exports.GetGematriaTexture = function(textureWidth) {
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


        var wordIndex = 0;
        var imageIndex = 0;
        var letterIndex = 0;
        var finished = false;

        while(!finished) {
          var word = GEMATRIA_HILIGHT.allWords[wordIndex];
          var letter = word[letterIndex++];

          if(letterIndex == word.length) {
            wordIndex++;
            letterIndex = 0;
          }
          if(wordIndex == GEMATRIA_HILIGHT.allWords.length) {
            finished = true;
          }

          var gematria = TXP.Utils.Gematria.CountHebArray(word);

          //to-do: largest gematria fits in 0xFFF actually... so we could squeeze both across rgb, but meh

          imgData.data[imageIndex++] = (gematria >> 8 & 0xFF); //high bits
          imgData.data[imageIndex++] = (gematria & 0xFF); //low bits
          imgData.data[imageIndex++] = 0x0; //unused atm
          imgData.data[imageIndex++] = 0xFF; //can't pass data here, seems to be pre-multipled or something

        }

        if((913 >> 8 & 0xFF) == imgData.data[0] && (913 & 0xFF) == imgData.data[1]) {
          console.log("looks good from imgData side");
        } else {
          console.log("error on imgData side");
        }

        ctx.putImageData(imgData, 0, 0);
        return PIXI.Texture.fromCanvas(canvas);
    }
    return exports;
}(GEMATRIA_HILIGHT || {}));
