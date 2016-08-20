var TXP = (function(exports) {
    var loader;
    var VERT = 'vert';
    var FRAG = 'frag';

    function getUrl(shaderName, style) {
      return 'shaders/' + shaderName + '.' + style;
    }

    function Load(shadersToLoad, callbacks) {
        loader = new PIXI.loaders.Loader();
        for(var i = 0; i < shadersToLoad.vertex.length; i++) {
          var shaderName = shadersToLoad.vertex[i];
          var shaderUrl = getUrl(shaderName,VERT);

          loader.add(shaderUrl);
        }

        for(var i = 0; i < shadersToLoad.fragment.length; i++) {
          var shaderName = shadersToLoad.fragment[i];
          var shaderUrl = getUrl(shaderName, FRAG);

          loader.add(shaderUrl);
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

    exports.Shaders.GetVertexCode = function(shaderName) {
        return loader.resources[getUrl(shaderName, VERT)].data;
    }

    exports.Shaders.GetFragmentCode = function(shaderName) {
        return loader.resources[getUrl(shaderName, FRAG)].data;
    }

    exports.Shaders.Load = Load;

    return exports;

}(TXP || {
    Utils: {},
    Shaders: {},
    Interactions: {},
    Books: {}
}));
