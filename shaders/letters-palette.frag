//https://github.com/pixijs/pixi.js/blob/364c2457c6693d6e3ab68786539c53d566503e7b/src/core/renderers/webgl/shaders/Shader.js#L232-L463

precision mediump float;

uniform sampler2D uSampler;
uniform float rPalette[28];
uniform float gPalette[28];
uniform float bPalette[28];
uniform float aPalette[28];
uniform float substitution;
varying vec2 vTextureCoord;

void main() {
  vec4 colorLookup = texture2D(uSampler, vTextureCoord);
  int paletteIndex;

  if(substitution == 0.0) {
    paletteIndex = int(colorLookup.r * 255.0);
  } else if(substitution == 1.0) {
    paletteIndex = int(colorLookup.g * 255.0);
  } else if(substitution == 2.0) {
    paletteIndex = int(colorLookup.b * 255.0);
  } else if(substitution == 3.0) {
    paletteIndex = int(colorLookup.a * 255.0);
  }

  /*  Yes - this is ridiculous, but it's the spec.
      See: http://stackoverflow.com/questions/6247572/variable-array-index-not-possible-in-webgl-shaders
      And: http://www.john-smith.me/hassles-with-array-access-in-webgl--and-a-couple-of-workarounds
      etc.

      note that I tried optimizing the loop to just be a whole bunch of if statements and I got a "memory exhaust" error too
  */

  for (int i = 0; i < 28; i++) {
    if (i == paletteIndex) {
      colorLookup.r = rPalette[i];
      colorLookup.g = gPalette[i];
      colorLookup.b = bPalette[i];
      colorLookup.a = aPalette[i];
      break;
    }
  }

  //for right now, alpha is always just 1.0 or 0.0 (on/off)
  gl_FragColor = colorLookup * colorLookup.a;
}
