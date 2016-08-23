TXP = (function(exports) {


  function Create(textureWidth, textureHeight, rgbaData,  callbackWithData) {
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

      if( callbackWithData !== undefined) {
         callbackWithData(imgData);
      }

      return PIXI.Texture.fromCanvas(canvas);
  }

  function CreateSolid(textureWidth, textureHeight, rgba,  callbackWithData) {
    var len = Math.ceil((textureWidth * textureHeight));
    var rgbaData = [];
    for(var i = 0; i < len; i++) {
      rgbaData[i] = {r: rgba.r, g: rgba.g, b: rgba.g, a: rgba.a};
    }

    return Create(textureWidth, textureHeight, rgbaData,  callbackWithData);
  }

  function CreateNumbers(textureWidth, textureHeight, arrayOfNumbers, callbackWithData) {
    var rgbaData = [];


    //split the value across RGB
    //0xFF is 8 bits, so red is shifted 8x2 bits (and masked with 8 bits), green is 8, blue is not shifted
    //it seems that alpha must be 0xFF for this to work and therefore can't be used to expand max val. Not sure why yet (pre-multiplied?)
    //max val is therefore 0xFFFFFF or 16777215

    for(var i = 0; i < arrayOfNumbers.length; i++) {
      var num = arrayOfNumbers[i];

      rgbaData.push({
        r: ((num >> 16) & 0xFF), //red
        g: ((num >> 8) & 0xFF), //green
        b: (num & 0xFF), //blue
        a: 0xFF //can't pass data here, seems to be pre-multipled or something
      });
    }

    return Create(textureWidth, textureHeight, rgbaData, callbackWithData);
  }



    exports.Utils.Texture = {
      Create: Create,
      CreateNumbers: CreateNumbers,
      CreateSolid: CreateSolid
    }

    return exports;

}(TXP || {
    Utils: {},
    Shaders: {},
    Interactions: {},
    TanachData: {}
}));
