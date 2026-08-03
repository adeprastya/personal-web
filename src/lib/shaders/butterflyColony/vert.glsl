attribute float aFlapTime;

vec3 rotateZ(vec3 pos, vec3 center, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  vec3 p = pos - center;
  vec3 rotated = vec3(p.x * c - p.y * s, p.x * s + p.y * c, p.z);
  return rotated + center;
}

void main() {
  vec3 post = position;

  vec3 scaledPos = post * vec3(1.0, 1.5, 1.0);
  float dist = length(scaledPos + vec3(0.0, 1.5, 0.0));
  float distanceBranch = dist * 0.3;

  float waveInput = aFlapTime - distanceBranch;
  float wave = sin(waveInput) * 1.0;

  float sideMultiplier = (post.x > 0.0) ? 1.0 : -1.0;
  float finalAngle = wave * sideMultiplier;

  vec3 center = vec3(0.0, 0.0, -1.6);
  vec3 rotatedPosition = rotateZ(post, center, finalAngle);

  #ifdef USE_INSTANCING
  vec4 worldPos = instanceMatrix * vec4(rotatedPosition, 1.0);
  #else
  vec4 worldPos = vec4(rotatedPosition, 1.0);
  #endif

  gl_Position = projectionMatrix * modelViewMatrix * worldPos;
}
