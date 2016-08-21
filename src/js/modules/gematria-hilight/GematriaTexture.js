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

          //largest gematria fits in 0xFFF actually... so we could squeeze a third, but meh
          var gematria = TXP.Utils.Gematria.CountHebArray(word);
          var gematriaSofit = TXP.Utils.Gematria.CountHebArray(word, {sofit: true});

          var gematria1;
          var gematria2;

          gematria1 = (gematria >> 8 & 0xFF);
          gematria2 = (gematria & 0xFF);

          if(gematria1 == 0.0 && gematria2 == 0.0) {
            console.log("gematria is 0?! " + wordIndex);
          }

          imgData.data[imageIndex++] = gematria1;
          imgData.data[imageIndex++] = gematria2;

          gematria1 = (gematriaSofit >> 8 & 0xFF);
          gematria2 = (gematriaSofit & 0xFF);

          if(gematria1 == 0.0 && gematria2 == 0.0) {
            console.log("gematria is 0?! " + wordIndex);
          }
          
          imgData.data[imageIndex++] = gematria1;
          imgData.data[imageIndex++] = gematria2;

        }


        ctx.putImageData(imgData, 0, 0);
        return PIXI.Texture.fromCanvas(canvas);
    }
    return exports;
}(GEMATRIA_HILIGHT || {}));
