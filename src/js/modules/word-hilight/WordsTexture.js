var WORD_HILIGHT = (function(exports) {

    function GetTextureHeight(textureWidth) {
      return Math.ceil(WORD_HILIGHT.allLetters.length / textureWidth);
    }

    exports.GetTextureHeight = GetTextureHeight;

    exports.GetWordsTexture = function(textureWidth, textureHeight) {
        var wordIndex = 0;
        var letterIndex = 0;
        var wordString;
        var wordLookup = {};
        var wordLookupIndex = 0;
        var wordsForTexture = [];

        while(wordIndex < WORD_HILIGHT.allWords.length && letterIndex < WORD_HILIGHT.allWords[wordIndex].length) {

          var word = WORD_HILIGHT.allWords[wordIndex];
          if(letterIndex == 0) {
            wordString = TXP.Utils.TextSubstitution.GetTextFromArray(word);

            if(!wordLookup.hasOwnProperty(wordString)) {
              wordLookup[wordString] = wordLookupIndex++;
            }

          }
          wordsForTexture.push(wordLookup[wordString]); //push for each letter

          if(++letterIndex == word.length) {
            wordIndex++;
            letterIndex = 0;
          }


        }

        exports.wordLookup = wordLookup;

        return TXP.Utils.Texture.CreateNumbers(textureWidth, textureHeight, wordsForTexture, function(imgData) {
          var testWord = WORD_HILIGHT.allWords[4];
          var testWordIndex = wordLookup[TXP.Utils.TextSubstitution.GetTextFromArray(testWord)]; //should be 4

          var testDataIndex = WORD_HILIGHT.allWords[0].concat(WORD_HILIGHT.allWords[1]).concat(WORD_HILIGHT.allWords[2]).concat(WORD_HILIGHT.allWords[3]).length;
          testDataIndex *= 4;

          if(testWordIndex != 4 || TXP.Utils.TextSubstitution.GetTextFromArray(testWord) != 'השמים') {
            console.log("WRONG TEST WORD INDEX!");
          }
          if(((testWordIndex >> 16) & 0xFF) == imgData.data[testDataIndex] && ((testWordIndex >> 8) & 0xFF) == imgData.data[testDataIndex+1] && (testWordIndex & 0xFF) == imgData.data[testDataIndex+2]) {
            console.log("looks good from imgData side");
          } else {
            console.log("ERROR ON TEXTURE TEST!!!!!");
          }

        });

    }
    return exports;
}(WORD_HILIGHT || {}));
