uniform float uStrength;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 centered = uv - 0.5;
  float dist = length(centered);
  vec2 dir = normalize(centered + 1e-6);

  float amount = uStrength * dist;

  float r = texture(inputBuffer, uv - dir * amount).r;
  float g = texture(inputBuffer, uv).g;
  float b = texture(inputBuffer, uv + dir * amount).b;

  outputColor = vec4(r, g, b, inputColor.a);
}
