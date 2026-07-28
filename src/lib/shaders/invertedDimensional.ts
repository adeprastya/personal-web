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
`;

export interface InvertedDimensionalSettings {
	progress: number;
	autoTime?: boolean; // true = uTime run every frame, false = manual via `time`
	time?: number;
}

export class InvertedDimensionalEffect extends Effect {
	private autoTime = true;

	constructor({
		progress = 0,
		time = 0,
		autoTime = true
	}: { progress?: number; time?: number; autoTime?: boolean } = {}) {
		super('DimensionalEffect', fragmentShader, {
			uniforms: new Map([
				['uProgress', new Uniform(progress)],
				['uTime', new Uniform(time)]
			])
		});
		this.autoTime = autoTime;
	}

	update(_renderer: unknown, _inputBuffer: unknown, deltaTime = 0) {
		if (this.autoTime) {
			this.uniforms.get('uTime')!.value += deltaTime;
		}
	}

	setAutoTime(value: boolean) {
		this.autoTime = value;
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
