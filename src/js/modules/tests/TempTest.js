var TESTS = (function(exports) {
    exports.TempTest = function() {
        var bookNames = TXP.Books.names;
        var letterCount = 0;
        var bookMax = 5; //TXP.Books.names.length; // 5; //chumash

        for(var i = 0; i < bookMax; i++) {
            var bookName = bookNames[i];
            var bookData = TXP.Books.GetData(bookName);
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

        console.log("TOTAL LETTERS: " + letterCount);

    }
    return exports;
}(TESTS || {}));
