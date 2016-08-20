TXP = (function(exports) {
  function CreateSolidTexture(textureWidth, textureHeight, rgba) {
    var len = Math.ceil((textureWidth * textureHeight));
    var rgbaData = [];
    for(var i = 0; i < len; i++) {
      rgbaData[i] = {r: rgba.r, g: rgba.g, b: rgba.g, a: rgba.a};
    }

    return CreateTextureFromData(textureWidth, textureHeight, rgbaData);
  }

  function CreateTextureFromData(textureWidth, textureHeight, rgbaData) {
      var canvas = document.createElement('canvas');
      canvas.width = textureWidth;
      canvas.height = textureHeight;

      var ctx = (function() {
          if (canvas.getContext == undefined) {
              return G_vmlCanvasManager.initElement(canvas).getContext("2d");
          }
          return canvas.getContext('2d')
      }());

      var imgData = ctx.createImageData(canvas.width, canvas.height);


      for (var d = 0, i = 0; d < rgbaData.length && i < imgData.data.length; d++) {
          var rgba = rgbaData[d];

          imgData.data[i++] = rgba.r; //red channel - baseLetter
          imgData.data[i++] = rgba.g; //blue channel - letter as atBash
          imgData.data[i++] = rgba.b; //green channel - letter as alBam
          imgData.data[i++] =  rgba.a; //alpha channel - maybe signify start of word, start of pasuk, start of book, etc.
      }
      ctx.putImageData(imgData, 0, 0);
      return PIXI.Texture.fromCanvas(canvas);
  }

    exports.Utils.Texture = {
      CreateTextureFromData: CreateTextureFromData,
      CreateSolidTexture: CreateSolidTexture
    }

    return exports;

}(TXP || {
    Utils: {},
    Shaders: {},
    Interactions: {},
    TanachData: {}
}));
