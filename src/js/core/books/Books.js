
var TANACH_CORE = (function(exports) {
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


    exports.Books = {
        Load: Load,
        GetData: GetData,
        GetConfig: GetConfig,
        names: bookNames
    }
    return exports;

}(TANACH_CORE || {
    Utils: {},
    Shaders: {},
    Interactions: {},
    Books: {}
}));
