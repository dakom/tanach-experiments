//https://github.com/pixijs/pixi.js/blob/364c2457c6693d6e3ab68786539c53d566503e7b/src/core/renderers/webgl/shaders/Shader.js#L232-L463

precision highp float;

uniform highp sampler2D uSampler;
uniform highp float gematria1;
uniform highp float gematria2;
uniform highp float sofit;
varying highp vec2 vTextureCoord;

void main() {
  highp vec4 colorLookup = texture2D(uSampler, vTextureCoord);
  highp vec4 finalColor = vec4(0.0, 0.0, 0.0, 1.0);

  //right now it should just be black!?
  highp float test1 = 0.0;
  highp float test2 = 0.0;

  if(sofit == 0.0) {
    if(colorLookup.r == test1 && colorLookup.g == test2) {
      finalColor.r = 1.0;
      finalColor.g = 1.0;
      finalColor.b = 0.0;
    }
  } else if(sofit == 1.0) {
    if(colorLookup.b == test1 && colorLookup.a == test2) {
      finalColor.r = 1.0;
      finalColor.g = 1.0;
      finalColor.b = 0.0;
    }
  }

  gl_FragColor = finalColor;
}
