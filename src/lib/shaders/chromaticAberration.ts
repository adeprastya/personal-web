import { Effect, BlendFunction } from 'postprocessing';
import { Uniform } from 'three';

const fragmentShader = /* glsl */ `
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
`;

export interface ChromaticAberrationSettings {
	strength: number;
}

export class ChromaticAberrationEffect extends Effect {
	constructor({ strength = 0.0025, blendFunction = BlendFunction.NORMAL } = {}) {
		super('ChromaticAberrationEffect', fragmentShader, {
			blendFunction,
			uniforms: new Map([['uStrength', new Uniform(strength)]])
		});
	}

	set strength(value: number) {
		this.uniforms.get('uStrength')!.value = value;
	}
	get strength() {
		return this.uniforms.get('uStrength')!.value;
	}
}
