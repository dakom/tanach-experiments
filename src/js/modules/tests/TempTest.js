var TESTS = (function(exports) {
    var CHUMASH_COUNT = 304801;
    var TANACH_COUNT = 1196838;

    exports.BookTest = function() {
        var bookNames = TXP.TanachData.Books.names;
        var letterCount = 0;
        var bookMax = 5; //TXP.Books.names.length; // 5; //chumash

        for(var i = 0; i < bookMax; i++) {
            var bookName = bookNames[i];
            var bookData = TXP.TanachData.Books.GetData(bookName);
            for (var p = 0; p < bookData.length; p++) {
                var pasuk = bookData[p];

                for (var w = 0; w < pasuk.length; w++) {
                    var word = pasuk[w];

                    for (var l = 0; l < word.length; l++) {
                        var letter = word[l];
                        letterCount++;
                    }
                }
            }
        }

        if(letterCount != CHUMASH_COUNT) {
          alert("CHUMASH BOOK TEST FAILED!");
        } else {
          console.log("CHUMASH BOOK TEST PASSED!");
        }

        letterCount = 0;
        bookMax = bookNames.length;
        for(var i = 0; i < bookMax; i++) {
            var bookName = bookNames[i];
            var bookData = TXP.TanachData.Books.GetData(bookName);
            for (var p = 0; p < bookData.length; p++) {
                var pasuk = bookData[p];

                for (var w = 0; w < pasuk.length; w++) {
                    var word = pasuk[w];

                    for (var l = 0; l < word.length; l++) {
                        var letter = word[l];
                        letterCount++;
                    }
                }
            }
        }

        if(letterCount != TANACH_COUNT) {
          alert("TANACH BOOK TEST FAILED!");
        } else {
          console.log("TANACH BOOK TEST PASSED!");
        }
    }

    exports.LettersTest = function() {
        var letterCount = TXP.TanachData.Letters.GetData().length;

        if(letterCount != TANACH_COUNT) {
          alert("TANACH LETTERS TEST FAILED! " + letterCount);
        } else {
          console.log("TANACH LETTERS TEST PASSED!");
        }
    }
    return exports;
}(TESTS || {}));
