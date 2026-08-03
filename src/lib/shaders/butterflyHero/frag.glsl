uniform float uTime;
uniform float uSpeed;
uniform float uRough;
uniform float uMaxRadius;
uniform float uWaveCount;

varying vec3 vPos;
varying vec3 vNormal;

vec3 mod289(vec3 x) {
  return x - floor(x * (1. / 289.)) * 289.;
}
vec4 mod289(vec4 x) {
  return x - floor(x * (1. / 289.)) * 289.;
}
vec4 permute(vec4 x) {
  return mod289((x * 34. + 1.) * x);
}
vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - .85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1. / 6., 1. / 3.);
  const vec4 D = vec4(0., .5, 1., 2.);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1. - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0., i1.z, i2.z, 1.)) + i.y + vec4(0., i1.y, i2.y, 1.)) + i.x + vec4(0., i1.x, i2.x, 1.));
  float n = .142857142857;
  vec3 ns = n * D.wyz - D.xzx;
  vec4 j = p - 49. * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7. * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1. - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy), b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2. + 1., s1 = floor(b1) * 2. + 1.;
  vec4 sh = -step(h, vec4(0.));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x), p1 = vec3(a0.zw, h.y), p2 = vec3(a1.xy, h.z), p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.);
  m *= m;
  return 42. * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
  vec3 viewDir = normalize(cameraPosition - vPos);
  float fresnel = pow(1. - max(dot(viewDir, vNormal), 0.), 2.5);

  vec3 p = vPos * 1.8;

  float rough = snoise(p * 1.4 + vec3(0., 0., uTime * .05)) * uRough;

  float dist = length(p) + rough;

  vec3 darkRed = vec3(.5, .01, .01);
  vec3 midRed = vec3(.75, .08, .05);
  vec3 brightRed = vec3(1., .25, .25);

  vec3 color = darkRed * fresnel * .45;
  float alpha = fresnel * .35;

  const int MAX_WAVES = 10;
  const float WIDTH = .12;
  const float FADE = 1.35;

  float cycle = uMaxRadius / uSpeed;

  for(int i = 0; i < MAX_WAVES; i++) {
    if(i >= int(uWaveCount))
      break;

    float radius = mod((uTime - cycle / uWaveCount * float(i)) * uSpeed, uMaxRadius);

    float edgeGlow = 1. - smoothstep(0., WIDTH, abs(dist - radius));

    float age = clamp((radius - dist) * .7, 0., 1.);

    float fill = step(dist, radius) * exp(-age * FADE);

    color += midRed * fill;
    color += brightRed * edgeGlow * 2.2;

    alpha += fill * .35;
    alpha += edgeGlow * .75;
  }

  color += brightRed * fresnel * .3;
  alpha = clamp(alpha, 0., 1.);

  gl_FragColor = vec4(color, alpha);
}
