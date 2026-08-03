attribute vec2 aInstanceData;
varying vec2 vWorldUV;
varying float vBlend;
varying float vThreshold;
uniform vec2 gridMin;
uniform vec2 gridSize;
uniform vec2 groupOffset;
uniform float uWavePower;
uniform float uWaveAmplitude;
uniform float uWaveSpeed;
uniform float uWaveFreq;
uniform float uTime;

mat4 rotationX(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, s, 0.0, 0.0, -s, c, 0.0, 0.0, 0.0, 0.0, 1.0);
}
mat4 rotationY(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat4(c, 0.0, -s, 0.0, 0.0, 1.0, 0.0, 0.0, s, 0.0, c, 0.0, 0.0, 0.0, 0.0, 1.0);
}

void main() {
  vBlend = aInstanceData.x;
  vThreshold = aInstanceData.y;

  vec4 localPos = vec4(position, 1.0);

  vec4 instanceCenter = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  float dist = length(instanceCenter.xy);

  float phase = dist * uWaveFreq - uTime * uWaveSpeed;
  float wave = sin(phase) * uWavePower;
  float posOffset = sin(phase) * uWaveAmplitude; // <-- gelombang yang sama dipakai utk posisi

  mat4 rotMat = rotationX(wave) * rotationY(wave);
  vec4 rotatedLocalPos = rotMat * localPos;

			// manipulasi posisi: geser di sumbu Z lokal instance sebelum ke world space
  rotatedLocalPos.z += posOffset;

  vec4 worldPos = modelMatrix * instanceMatrix * rotatedLocalPos;

  vWorldUV = (worldPos.xy - groupOffset - gridMin) / gridSize;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}