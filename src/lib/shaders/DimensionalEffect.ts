import { Effect } from 'postprocessing';
import { Uniform } from 'three';

const fragmentShader = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;

  vec2 waveDistort(vec2 uv, float strength, float time) {
    float waveX = sin(uv.y * 12.0 + time * 2.5) * strength;
    float waveY = cos(uv.x * 10.0 + time * 2.0) * strength;
    return clamp(uv + vec2(waveX, waveY), 0.001, 0.999);
  }

  vec3 chromaticAberration(vec2 uv, float strength) {
    vec2 dir    = normalize(uv - 0.5);
    float dist  = length(uv - 0.5);
    vec2 offset = dir * dist * strength;

    float r = texture(inputBuffer, clamp(uv + offset, 0.001, 0.999)).r;
    float g = texture(inputBuffer, uv).g;
    float b = texture(inputBuffer, clamp(uv - offset, 0.001, 0.999)).b;

    return vec3(r, g, b);
  }

  float vignette(vec2 uv, float strength) {
    vec2 d = abs(uv - 0.5) * 2.0;
    return clamp(1.0 - dot(d, d) * strength, 0.0, 1.0);
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    float p = uProgress;

    // 1. Wave distortion
    vec2 distortedUV = waveDistort(uv, p * 0.018, uTime);

    // 2. Sample ulang dari UV terdistorsi
    vec4 distortedSample = texture(inputBuffer, distortedUV);

    // 3. Chromatic aberration di atas UV terdistorsi
    vec3 aberrated = chromaticAberration(distortedUV, p * 0.025);
    vec3 color = mix(distortedSample.rgb, aberrated, p);

    // 4. Invert
    color = mix(color, 1.0 - color, p);

    // 5. Desaturasi
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(color, vec3(luma), p * 0.4);

    outputColor = vec4(color, inputColor.a);
  }
`;

export class DimensionalEffect extends Effect {
	constructor({ progress = 0, time = 0 }: { progress?: number; time?: number } = {}) {
		super('DimensionalEffect', fragmentShader, {
			uniforms: new Map([
				['uProgress', new Uniform(progress)],
				['uTime', new Uniform(time)]
			])
		});
	}

	get progress(): number {
		return this.uniforms.get('uProgress')!.value;
	}
	set progress(value: number) {
		this.uniforms.get('uProgress')!.value = value;
	}

	get time(): number {
		return this.uniforms.get('uTime')!.value;
	}
	set time(value: number) {
		this.uniforms.get('uTime')!.value = value;
	}
}
