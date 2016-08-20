//https://github.com/pixijs/pixi.js/blob/364c2457c6693d6e3ab68786539c53d566503e7b/src/core/renderers/webgl/shaders/Shader.js#L232-L463

precision mediump float;

uniform sampler2D uSampler;
uniform sampler2D lSampler;
uniform vec3 palette[1];
varying vec2 vTextureCoord;

void main() {

  vec4 colorLookup = texture2D(lSampler, vTextureCoord);

  vec3 pColor = palette[0];
  gl_FragColor.r = pColor.x; //base letter ... not working yet :\
  gl_FragColor.g = pColor.y; //base letter ... not working yet :\
  gl_FragColor.b = pColor.z; //base letter ... not working yet :\
  gl_FragColor.a = 1.0;

  //finalColor = pallete[colorLookup.g]; //atbash
  //finalColor = pallete[colorLookup.b]; //albam



}
