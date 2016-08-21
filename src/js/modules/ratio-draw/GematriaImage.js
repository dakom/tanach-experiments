var RATIO_DRAW = (function(exports) {


    var GematriaFill = function(gTexture) {
      PIXI.Filter.call(this, TXP.Shaders.GetVertexCode('default'), TXP.Shaders.GetFragmentCode('ratio'), {
            gSampler: {
                type: 'sampler2D',
                value: gTexture
            }
        });

    }

    GematriaFill.prototype = Object.create(PIXI.Filter.prototype);
    GematriaFill.prototype.constructor = GematriaFill;
    Object.defineProperties(GematriaFill.prototype, {

        gTexture: {
            get: function() {
                return this.uniforms.gSampler;
            },
            set: function(value) {
                console.log("Changed in filter!");
                this.uniforms.gSampler = value;
            }
        },
    });

    function getTextureFromData(gematriaData, options) {
      var canvas = document.createElement('canvas');
    canvas.width = TXP.canvasWidth;
    canvas.height = TXP.canvasHeight;

        var ctx = (function() {
            if (canvas.getContext == undefined) {
                return G_vmlCanvasManager.initElement(canvas).getContext("2d");
            }
            return canvas.getContext('2d')
        }());

        var imgData = ctx.createImageData(canvas.width, canvas.height);

        var gMax = 0;
        for (var i = 0; i < gematriaData.length; i++) {
            if (gematriaData[i] > gMax) {
                gMax = gematriaData[i];
            }
        }

        var rgbMax = 0xFFFFFF;

        var gIndex = 0;
        for (var i = 0; i < imgData.data.length; i += 4) {
            if (gIndex > gematriaData.length) {
                gIndex = 0;
            }

            var gData = gematriaData[gIndex++];

            if (options.method == 1) {
                var perc = gData / gMax;
                var relativeRGB = perc * rgbMax;
                var r = Math.floor(relativeRGB / (256 * 256));
                var g = Math.floor(relativeRGB / 256) % 256;
                var b = relativeRGB % 256;

                imgData.data[i + 0] = r;
                imgData.data[i + 1] = g;
                imgData.data[i + 2] = b;
                imgData.data[i + 3] = 0xFF;
            }
        }
        ctx.putImageData(imgData, 0, 0);
        return PIXI.Texture.fromCanvas(canvas);
    }

    exports.DrawGematriaImage = function(gematriaData) {

        var pTex = getTextureFromData(gematriaData, {
            method: 1
        });

        //create a graphic object to hold the filter, set it to white.
        var graphics = new PIXI.Graphics();
        graphics.beginFill(0xFFFFFF);
        graphics.drawRect(0, 0, pTex.width, pTex.height);
        graphics.endFill();

        //pass it to the filter (which can access both base texture - which is white or whatever, and gematria data)
        var filter = new GematriaFill(pTex);
        graphics.filters = [filter];
        //can change on the fly via filter.gTexture = pTex;

        //show it!
        TXP.stage.addChild(graphics);

    }

    return exports;
}(RATIO_DRAW || {}));
