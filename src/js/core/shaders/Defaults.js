var TANACH_CORE = (function(exports) {
    var str = "";

    str += "attribute vec2 aVertexPosition;";
    str += "attribute vec2 aTextureCoord;";

    str += "uniform mat3 projectionMatrix;";

    str += "varying vec2 vTextureCoord;";

    str += "void main(void)";
    str += "{";
    str += "gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);";
    str += "vTextureCoord = aTextureCoord;";
    str += "}";

    exports.Shaders.DefaultVert = str;

    return exports;
  }(TANACH_CORE || {
    Utils: {},
    Shaders: {},
    Interactions: {},
    Books: {}
  }));
