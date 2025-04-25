// Dynamic Iridescent Shader
// Creates a shimmering, rainbow-like effect with dynamic color transitions
// using noise patterns, fresnel effect, and time-based animations

uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

// Noise function
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,
                     0.366025403784439,
                    -0.577350269189626,
                     0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                 + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  // Enhanced Fresnel effect with normal variation
  vec3 viewDir = normalize(vViewPosition);
  float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);
  
  // Multi-layered noise pattern
  float noise = snoise(vUv * 3.0 + time * 0.2) * 0.5 + 0.5;
  noise += snoise(vUv * 6.0 - time * 0.1) * 0.25;
  noise += snoise(vUv * 9.0 + time * 0.3) * 0.125;
  
  // Dynamic color palette
  vec3 color1 = vec3(0.1, 0.5, 0.9); // Blue
  vec3 color2 = vec3(0.9, 0.1, 0.5); // Pink
  vec3 color3 = vec3(0.1, 0.9, 0.5); // Green
  vec3 color4 = vec3(0.8, 0.8, 0.1); // Yellow
  
  float t1 = sin(time * 0.5) * 0.5 + 0.5;
  float t2 = cos(time * 0.3) * 0.5 + 0.5;
  
  // Complex color mixing
  vec3 baseColor = mix(color1, color2, fresnel);
  baseColor = mix(baseColor, color3, noise * t1);
  baseColor = mix(baseColor, color4, noise * t2 * 0.5);
  
  // Enhanced shimmer effect
  float shimmer = sin(noise * 10.0 + time * 2.0) * 0.1 + 0.9;
  shimmer *= sin(noise * 15.0 - time * 1.5) * 0.05 + 0.95;
  
  // Final color with enhanced highlights
  vec3 finalColor = baseColor * shimmer;
  finalColor += pow(fresnel, 2.0) * 0.5;
  finalColor += pow(noise, 8.0) * 0.3; // Sharp highlights
  
  gl_FragColor = vec4(finalColor, 1.0);
}