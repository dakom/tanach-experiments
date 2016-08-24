//https://github.com/pixijs/pixi.js/blob/364c2457c6693d6e3ab68786539c53d566503e7b/src/core/renderers/webgl/shaders/Shader.js#L232-L463
precision mediump float;

uniform sampler2D uSampler;
uniform float rVal;
uniform float gVal;
uniform float bVal;
uniform vec4 matchColor;
uniform vec4 bgColor;
varying vec2 vTextureCoord;

void main() {
  vec4 colorLookup = texture2D(uSampler, vTextureCoord);

  if(colorLookup.r == rVal && colorLookup.g == gVal && colorLookup.b == bVal) {
    gl_FragColor = matchColor;
  } else {
    gl_FragColor = bgColor;
  }
}
