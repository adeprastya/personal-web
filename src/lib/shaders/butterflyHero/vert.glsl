uniform float uTime;

varying vec3 vNormal;
varying vec3 vPos;

vec3 rotateZ(vec3 pos, vec3 center, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  vec3 p = pos - center;
  vec3 rotated = vec3(p.x * c - p.y * s, p.x * s + p.y * c, p.z);
  return rotated + center;
}

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPos = position;

  vec3 post = position;
  float timeBranch = uTime;

  vec3 scaledPos = post * vec3(1.0, 1.5, 1.0);
  float dist = distance(scaledPos, vec3(0.0, -1.5, 0.0));
  float distanceBranch = dist * 0.3;

  float waveInput = timeBranch - distanceBranch;
  float wave = sin(waveInput) * 1.0;

  float sideMultiplier = (post.x > 0.0) ? 1.0 : -1.0;

  float finalAngle = wave * sideMultiplier;

  vec3 center = vec3(0.0, 0.0, -1.6);

  vec3 rotatedPosition = rotateZ(post, center, finalAngle);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(rotatedPosition, 1.0);
}