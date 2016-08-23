var GEMATRIA_HILIGHT = (function(exports) {

    function GetTextureHeight(textureWidth) {
      return Math.ceil(GEMATRIA_HILIGHT.allLetters.length / textureWidth);
    }

    exports.GetTextureHeight = GetTextureHeight;

    exports.GetGematriaTexture = function(textureWidth, textureHeight) {
        var gematrias = [];
        var wordIndex = 0;
        var letterIndex = 0;
        var gematria;

        while(wordIndex < GEMATRIA_HILIGHT.allWords.length && letterIndex < GEMATRIA_HILIGHT.allWords[wordIndex].length) {

          var word = GEMATRIA_HILIGHT.allWords[wordIndex];
          if(letterIndex == 0) {
            gematria = TXP.Utils.Gematria.CountHebArray(word);
          }
          gematrias.push(gematria); //push for each letter

          if(++letterIndex == word.length) {
            wordIndex++;
            letterIndex = 0;
          }


        }

        return TXP.Utils.Texture.CreateNumbers(textureWidth, textureHeight, gematrias, function(imgData) {
          //small test
          if(((913 >> 16) & 0xFF) == imgData.data[0] && ((913 >> 8) & 0xFF) == imgData.data[1] && (913 & 0xFF) == imgData.data[2]) {
            console.log("looks good from imgData side");
          } else {
            console.log("ERROR ON TEXTURE TEST!!!!!");
          }

        });

    }
    return exports;
}(GEMATRIA_HILIGHT || {}));
