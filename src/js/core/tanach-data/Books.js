var TXP = (function(exports) {
    var loader;
    var flatData;

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

      ret = [];
      var allData = GetData();
      bookMax = allData.length;
      for(var i = 0; i < bookMax; i++) {

          var bookData = allData[i];
          for (var p = 0; p < bookData.length; p++) {
              var pasuk = bookData[p];

              for (var w = 0; w < pasuk.length; w++) {
                  var word = pasuk[w];

                  for (var l = 0; l < word.length; l++) {
                      var letter = word[l];
                      ret.push(letter);
                  }
              }
          }
      }

      return ret;


    }

    function GetAllWords(style) {

      ret = [];
      var allData = GetData();
      bookMax = allData.length;
      for(var i = 0; i < bookMax; i++) {

          var bookData = allData[i];
          for (var p = 0; p < bookData.length; p++) {
              var pasuk = bookData[p];

              for (var w = 0; w < pasuk.length; w++) {
                  var word = pasuk[w];
                  ret.push(word);

              }
          }
      }

      return ret;
    }



    exports.TanachData.Books = {
      Load: Load,
      GetData: GetData,
      GetAllLetters: GetAllLetters,
      GetAllWords: GetAllWords,
    }

    return exports;

}(TXP || {
    Utils: {},
    Shaders: {},
    Interactions: {},
    TanachData: {}
}));
