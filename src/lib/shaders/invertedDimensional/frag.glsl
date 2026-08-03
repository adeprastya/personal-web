uniform float uProgress;
uniform float uTime;

vec2 waveDistort(vec2 uv, float strength, float time) {
  float waveX = sin(uv.y * 12.0 + time * 2.5) * strength;
  float waveY = cos(uv.x * 10.0 + time * 2.0) * strength;
  return clamp(uv + vec2(waveX, waveY), 0.001, 0.999);
}

vec3 chromaticAberration(vec2 uv, float strength) {
  vec2 dir = normalize(uv - 0.5);
  float dist = length(uv - 0.5);
  vec2 offset = dir * dist * strength;

  float r = texture(inputBuffer, clamp(uv + offset, 0.001, 0.999)).r;
  float g = texture(inputBuffer, uv).g;
  float b = texture(inputBuffer, clamp(uv - offset, 0.001, 0.999)).b;

  return vec3(r, g, b);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float p = uProgress;

  vec2 distortedUV = waveDistort(uv, p * 0.018, uTime);
  vec4 distortedSample = texture(inputBuffer, distortedUV);

  vec3 aberrated = chromaticAberration(distortedUV, p * 0.025);
  vec3 color = mix(distortedSample.rgb, aberrated, p);

  color = mix(color, 1.0 - color, p);

  float luma = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(color, vec3(luma), p * 0.4);

  outputColor = vec4(color, inputColor.a);
}
