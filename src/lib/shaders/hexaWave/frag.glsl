uniform sampler2D mapA;
uniform sampler2D mapB;
uniform int hasMapA;
uniform int hasMapB;
varying vec2 vWorldUV;
varying float vBlend;
varying float vThreshold;

void main() {
  float t = step(vThreshold, vBlend);

  vec4 colA = hasMapA == 1 ? texture2D(mapA, vWorldUV) : vec4(0.0);
  vec4 colB = hasMapB == 1 ? texture2D(mapB, vWorldUV) : vec4(0.0);

  vec4 col = mix(colA, colB, t);

  if(col.a < 0.01)
    discard;
  gl_FragColor = vec4(col.rgb, col.a * 0.5);
}