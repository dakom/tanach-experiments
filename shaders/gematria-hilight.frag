//https://github.com/pixijs/pixi.js/blob/364c2457c6693d6e3ab68786539c53d566503e7b/src/core/renderers/webgl/shaders/Shader.js#L232-L463
precision mediump float;

uniform sampler2D uSampler;
uniform float gematriaHigh;
uniform float gematriaLow;
uniform vec4 hilightColor;
varying vec2 vTextureCoord;

void main() {
  vec4 colorLookup = texture2D(uSampler, vTextureCoord);
  vec4 finalColor = vec4(0.0, 0.0, 0.0, 1.0);

  if(colorLookup.r == gematriaHigh && colorLookup.g == gematriaLow) {
    finalColor = hilightColor;
  }

  gl_FragColor = finalColor;
}
