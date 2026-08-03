import { Effect, BlendFunction } from 'postprocessing';
import { Uniform } from 'three';
import frag from '$lib/shaders/chromaticAberration/frag.glsl?raw';

/** Configuration options exposed for the chromatic aberration post-processing pass. */
export interface ChromaticAberrationSettings {
	/** Intensity of the RGB channel offset. Higher values produce a stronger color-fringing effect. */
	strength: number;
}

/**
 * Post-processing effect that simulates chromatic aberration by offsetting
 * the red/green/blue channels, producing a color-fringing look toward the
 * edges of the frame. Built on top of the `postprocessing` library's `Effect`
 * base class and driven by a custom fragment shader.
 */
export class ChromaticAberrationEffect extends Effect {
	/**
	 * @param options - Effect configuration.
	 * @param options.strength - Initial aberration intensity. Defaults to `0.0025`.
	 * @param options.blendFunction - How this effect blends with the rest of the
	 *   post-processing chain. Defaults to `BlendFunction.NORMAL`.
	 */
	constructor({ strength = 0.0025, blendFunction = BlendFunction.NORMAL } = {}) {
		super('ChromaticAberrationEffect', frag, {
			blendFunction,
			// `uStrength` is read by the fragment shader to control the per-channel offset amount.
			uniforms: new Map([['uStrength', new Uniform(strength)]])
		});
	}

	/** Updates the aberration intensity uniform, taking effect on the next render. */
	set strength(value: number) {
		this.uniforms.get('uStrength')!.value = value;
	}

	/** Current aberration intensity. */
	get strength() {
		return this.uniforms.get('uStrength')!.value;
	}
}
