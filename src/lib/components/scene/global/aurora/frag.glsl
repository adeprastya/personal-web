precision highp float;

uniform float time;
uniform float intensity;
uniform float speed;
uniform float exposure;

uniform vec3 color;
uniform vec3 foldColor;
uniform vec3 overlapColor;
uniform vec3 glowColor;

uniform int layerCount;

uniform vec4 layerShape[8];
uniform vec4 layerMotion[8];
uniform vec3 layerColor[8];

uniform float rayFrequency;
uniform float raySpeed;
uniform float rayIntensity;

uniform float horizonStart;
uniform float horizonEnd;
uniform float horizonFloor;

uniform float glowCenter;
uniform float glowWidth;

uniform float ditherStrength;

varying vec3 vDirection;

/* =========================================================
   NOISE
   ========================================================= */

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);

  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  f *= f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 1.5;

  for(int i = 0; i < 5; i++) {
    value += noise(p) * amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}

/* =========================================================
   CURTAIN
   ========================================================= */

float getCurtain(
  float longitude,
  float latitude,
  float t,
  vec4 shape,
  vec4 motion,
  out float offset,
  out float fold
) {
  float height = shape.x;
  float width = shape.y;
  float frequency = shape.z;

  float wave1 = sin(longitude * frequency +
    t * 0.45);

  float wave2 = sin(longitude * frequency * 1.7 -
    t * 0.25 +
    wave1 * 1.4);

  float wave3 = sin(longitude * frequency * 3.2 +
    t * 0.15 +
    wave2);

  float distortion = fbm(vec2(longitude * 1.5 + t * 0.035, latitude * 2.2));

  float center = height;

  center += wave1 * 0.16;
  center += wave2 * 0.055;
  center += wave3 * 0.015;
  center += (distortion - 0.5) * 0.085;

  offset = latitude - center;

  float density = exp(-(offset * offset) /
    (width * width));

  float foldLarge = abs(cos(longitude * frequency + t * 0.45));

  float foldMedium = abs(cos(longitude * frequency * 1.7 - t * 0.25));

  float foldSmall = abs(cos(longitude * frequency * 3.2 + t * 0.15));

  fold = foldLarge * 0.55 +
    foldMedium * 0.30 +
    foldSmall * 0.15;

  float foldNoise = fbm(vec2(longitude * 2.8 - t * 0.06, latitude * 1.3));

  fold *= mix(0.72, 1.18, foldNoise);

  return density;
}

/* =========================================================
   MAIN
   ========================================================= */

void main() {
  vec3 direction = normalize(vDirection);

  float longitude = atan(direction.z, direction.x);

  float latitude = asin(clamp(direction.y, -1.0, 1.0));

  float t = time * speed;

  float bands[8];
  float folds[8];

  vec3 finalColor = vec3(0.0);

	/* -------------------------------------------------------
	   LAYERS
	   ------------------------------------------------------- */

  for(int i = 0; i < 8; i++) {
    if(i >= layerCount) {
      break;
    }

    vec4 shape = layerShape[i];
    vec4 motion = layerMotion[i];

    float offset;
    float fold;

    float band = getCurtain(longitude + shape.w, latitude, t * motion.x, shape, motion, offset, fold);

    // garis-garis tipis vertikal khas tirai aurora
    float rayNoise = fbm(vec2(longitude * rayFrequency + float(i) * 3.7, t * raySpeed * 0.5));
    float rays = mix(1.0 - rayIntensity, 1.0 + rayIntensity, rayNoise);

    band *= rays;

    bands[i] = band;
    folds[i] = fold;

    float brightness = 1.0 + fold * motion.z;

    finalColor += layerColor[i] *
      pow(band, 0.72) *
      motion.y *
      brightness;
  }

	/* -------------------------------------------------------
	   SHIMMER
	   ------------------------------------------------------- */

  float shimmer = 0.91 +
    0.09 * noise(vec2(longitude * 1.7, latitude * 2.4 + t * 0.08));

  finalColor *= shimmer;

	/* -------------------------------------------------------
	   FOLD GLOW
	   ------------------------------------------------------- */

  if(layerCount > 0) {
    float hotFold = smoothstep(0.62, 1.0, folds[0]);

    finalColor += foldColor *
      pow(bands[0], 1.7) *
      hotFold *
      0.32;
  }

	/* -------------------------------------------------------
	   OVERLAP
	   ------------------------------------------------------- */

  if(layerCount > 1) {
    float overlap = bands[0] * bands[1];

    finalColor += overlapColor *
      pow(overlap, 0.7) *
      0.42;
  }

	/* -------------------------------------------------------
	   ATMOSPHERIC GLOW
	   ------------------------------------------------------- */

  float glow = exp(-((latitude - glowCenter) *
    (latitude - glowCenter)) / glowWidth);

  float layerGlow = 0.0;

  if(layerCount > 0) {
    layerGlow += bands[0];
  }

  if(layerCount > 1) {
    layerGlow += bands[1] * 0.45;
  }

  finalColor += glowColor *
    glow *
    layerGlow *
    0.06;

	/* -------------------------------------------------------
	   HORIZON
	   ------------------------------------------------------- */

  float horizon = smoothstep(horizonStart, horizonEnd, direction.y);

  finalColor *= mix(horizonFloor, 1.0, horizon);

	/* -------------------------------------------------------
	   TONE MAPPING
	   ------------------------------------------------------- */

  finalColor *= intensity;

  finalColor = vec3(1.0) -
    exp(-finalColor * exposure);

  // dither halus untuk mengurangi banding di area gelap
  finalColor += (hash(gl_FragCoord.xy) - 0.5) * ditherStrength;

	/* -------------------------------------------------------
	   ALPHA
	   ------------------------------------------------------- */

  float alpha = clamp(max(finalColor.r, max(finalColor.g, finalColor.b)), 0.0, 1.0);

  gl_FragColor = vec4(finalColor, alpha);
}