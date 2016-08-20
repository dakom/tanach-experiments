var TXP = (function(exports) {
    var loader;

    function Load(callbacks) {
        loader = new PIXI.loaders.Loader();
        loader.add('letters', 'media/tanach/letters/letters.json');

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
        return loader.resources['letters'].data;
    }


    exports.TanachData.Letters = {
      Load: Load,
      GetData: GetData,
    }

    return exports;

}(TXP || {
    Utils: {},
    Shaders: {},
    Interactions: {},
    TanachData: {}
}));
