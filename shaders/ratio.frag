// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

uniform sampler2D gSampler;
varying vec2 vTextureCoord;

void main() {
  gl_FragColor = texture2D(gSampler, vTextureCoord);
}
