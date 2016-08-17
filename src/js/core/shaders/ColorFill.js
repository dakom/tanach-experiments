var TANACH_CORE = (function(exports) {
    var ColorFill = function(hexVal) {
        var str = "";

        str += "precision mediump float;";

        str += "varying vec2 vTextureCoord;";
        str += "uniform sampler2D uSampler;";
        str += "uniform vec3 rgbColor;";


        str += "void main(void) {";

        str += "gl_FragColor = texture2D(uSampler, vTextureCoord);";
        str += "gl_FragColor.r = rgbColor.r * gl_FragColor.a;";
        str += "gl_FragColor.g = rgbColor.g * gl_FragColor.a;";
        str += "gl_FragColor.b = rgbColor.b * gl_FragColor.a;";
        str += "}";

        PIXI.Filter.call(this, TANACH_CORE.Shaders.DefaultVert, str);

        if (hexVal !== undefined) {
            this.hexColor = hexVal;
        }
    }

    ColorFill.prototype = Object.create(PIXI.Filter.prototype);
    ColorFill.prototype.constructor = ColorFill;
    Object.defineProperties(ColorFill.prototype, {
        rgbColor: {
            get: function() {
                return this.uniforms.rgbColor;
            },
            set: function(value) {
                this.uniforms.rgbColor = value;
            }
        },

        hexColor: {
            get: function() {
                return PIXI.utils.rgb2hex(this.uniforms.rgbColor);
            },
            set: function(value) {
                this.uniforms.rgbColor = PIXI.utils.hex2rgb(value);
            }
        },
    });

    exports.Shaders.ColorFill = ColorFill;

    return exports;

  }(TANACH_CORE || {
    Utils: {},
    Shaders: {},
    Interactions: {},
    Books: {}
  }));
