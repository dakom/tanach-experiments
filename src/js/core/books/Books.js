var TXP = (function(exports) {
    var loader;
    var bookNames = [
        'bereishit',
        'shmot',
        'vayikra',
        'bamidbar',
        'devarim',
        'yehoshua',
        'shoftim',
        'shmueli',
        'shmuelii',
        'melachimi',
        'melachimii',
        'yishayahu',
        'yirmiyahu',
        'yechezkiel',
        'hosea',
        'yoel',
        'amos',
        'ovadiah',
        'yonah',
        'micha',
        'nachum',
        'chabakuk',
        'zephaniah',
        'chaggai',
        'zechariah',
        'malachai',
        'tehillim',
        'mishlei',
        'iyov',
        'shirhashirim',
        'ruth',
        'eicha',
        'kohelet',
        'esther',
        'daniel',
        'ezra',
        'nechemia',
        'divreihayamimi',
        'divreihayamimii'
    ];

    function Load(callbacks) {
        loader = new PIXI.loaders.Loader();
        for (var i = 0; i < bookNames.length; i++) {
            var bookName = bookNames[i];
            loader.add(bookName, 'media/tanach/' + bookName + '.json');
        }

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

    function GetConfig(bookName) {
        return loader.resources[bookName].data;
    }

    function GetData(bookName) {
        return GetConfig(bookName).data;
    }


    function GetFlattened(opts) {
        if (opts.benchMark) {
            opts.startTime = new Date().getTime();
        }

        var bookNames = TXP.Books.names;
        var letterCount = 0;
        //inclusive start
        var bookStartIndex = (opts.bookStartIndex === undefined) ? 0 : opts.bookStartIndex;
        //non-inclusive end (5 is all of chumash)
        var bookEndIndex = (opts.bookEndIndex === undefined) ? bookNames.length : opts.bookEndIndex;
        var ret = [];
        var gemCount = 0;

        for (var b = bookStartIndex; b < bookEndIndex; b++) {
            var bookData = GetData(bookNames[b]);
            for (var p = 0; p < bookData.length; p++) {
                var pasuk = bookData[p];

                for (var w = 0; w < pasuk.length; w++) {
                    var word = pasuk[w];
                    if (opts.gematriaPerWord == true) {
                        var gVal = TXP.Utils.Gematria.CountHebArray(word);
                        ret.push(gVal);
                    } else {
                        for (var l = 0; l < word.length; l++) {
                            var letter = word[l];
                            if (opts.gematriaPerLetter == true) {
                              var gVal = TXP.Utils.TextSubstitution.GEMATRIA_ABSOLUTE_SOFIT[TXP.Utils.TextSubstitution.SUBSTITUTION_ATBASH[letter]];

                              ret.push(gVal);
                            } else {
                              ret.push(letter);
                            }
                        }
                    }
                }
            }
        }

        if (opts.benchMark) {
            var timeDiff = new Date().getTime() - opts.startTime;
            console.log("total time: " + timeDiff + " milliseconds");
        }

        return ret;
    }


    exports.Books.Load = Load;
    exports.Books.GetData = GetData;
    exports.Books.GetConfig = GetConfig;
    exports.Books.GetFlattened = GetFlattened;
    exports.Books.names = bookNames;

    return exports;

}(TXP || {
    Utils: {},
    Shaders: {},
    Interactions: {},
    Books: {}
}));
