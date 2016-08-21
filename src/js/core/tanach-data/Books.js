var TXP = (function(exports) {
    var loader;
    var flatData;
    var allLetters;
    var allWords;
    var letterInfos;

    function Load(callbacks) {
        loader = new PIXI.loaders.Loader();
        loader.add('books', 'media/tanach/books/all-books.json');

        if (callbacks !== undefined) {
            if (callbacks.onProgress !== undefined) {
                loader.on('progress', callbacks.onProgress);
            }

            if (callbacks.onError !== undefined) {
                loader.on('error', callbacks.onError);
            }

            if (callbacks.onLoad !== undefined) {
                loader.on('load', callbacks.onLoad);
            }

            if (callbacks.onComplete !== undefined) {
                loader.on('complete', callbacks.onComplete);
            }
        }

        loader.load();
    }


    function GetData() {
        return loader.resources['books'].data;
    }

    function GetAllLetters() {
        if (allLetters === undefined) {
            letterInfos = [];

            allLetters = [];
            var allData = GetData();
            bookMax = allData.length;
            for (var i = 0; i < bookMax; i++) {

                var bookData = allData[i];
                for (var p = 0; p < bookData.length; p++) {
                    var pasuk = bookData[p];

                    for (var w = 0; w < pasuk.length; w++) {
                        var word = pasuk[w];

                        for (var l = 0; l < word.length; l++) {
                            var letter = word[l];
                            allLetters.push(letter);
                            letterInfos.push({
                              book: i,
                              pasuk: p,
                              word: w,
                              letter: l
                            });
                        }
                    }
                }
            }
        }



        return allLetters;


    }



    function GetAllWords(style) {
        if (allWords === undefined) {
            allWords = [];
            var allData = GetData();
            bookMax = allData.length;
            for (var i = 0; i < bookMax; i++) {

                var bookData = allData[i];
                for (var p = 0; p < bookData.length; p++) {
                    var pasuk = bookData[p];

                    for (var w = 0; w < pasuk.length; w++) {
                        var word = pasuk[w];
                        allWords.push(word);

                    }
                }
            }
        }

        return allWords;
    }

    function GetLetterInfos() {
        GetAllLetters();

        return letterInfos;
    }

    exports.TanachData.Books = {
        Load: Load,
        GetData: GetData,
        GetAllLetters: GetAllLetters,
        GetAllWords: GetAllWords,
        GetLetterInfos: GetLetterInfos,
    }

    return exports;

}(TXP || {
    Utils: {},
    Shaders: {},
    Interactions: {},
    TanachData: {}
}));
