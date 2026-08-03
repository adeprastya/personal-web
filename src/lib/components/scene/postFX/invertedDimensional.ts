import { Effect } from 'postprocessing';
import { Uniform } from 'three';
import frag from '$lib/shaders/invertedDimensional/frag.glsl?raw';

/** Configuration options exposed for the inverted dimensional post-processing pass. */
export interface InvertedDimensionalSettings {
	/** Controls the transition amount of the dimensional distortion effect. */
	progress: number;

	/**
	 * Whether the internal time uniform should advance automatically every frame.
	 * - `true`: `uTime` is updated automatically in {@link update}.
	 * - `false`: `uTime` must be controlled manually through {@link time}.
	 *
	 * @default true
	 */
	autoTime?: boolean;

	/**
	 * Initial value of the internal time uniform.
	 * Only used when the effect is created or when `autoTime` is disabled.
	 *
	 * @default 0
	 */
	time?: number;
}

/**
 * Post-processing effect that renders an inverted dimensional distortion.
 * The effect is controlled by a transition progress value and an animated
 * time uniform that can either advance automatically every frame or be
 * driven manually.
 */
export class InvertedDimensionalEffect extends Effect {
	private autoTime = true;

	/**
	 * @param options - Effect configuration.
	 * @param options.progress - Initial transition progress. Defaults to `0`.
	 * @param options.time - Initial time value. Defaults to `0`.
	 * @param options.autoTime - Whether `uTime` should advance automatically
	 * every frame. Defaults to `true`.
	 */
	constructor({
		progress = 0,
		time = 0,
		autoTime = true
	}: {
		progress?: number;
		time?: number;
		autoTime?: boolean;
	} = {}) {
		super('DimensionalEffect', frag, {
			uniforms: new Map([
				// `uProgress` controls the overall transition amount.
				['uProgress', new Uniform(progress)],
				// `uTime` drives time-based animation inside the fragment shader.
				['uTime', new Uniform(time)]
			])
		});

		this.autoTime = autoTime;
	}

	/**
	 * Advances the internal time uniform every frame when automatic time
	 * progression is enabled.
	 */
	update(_renderer: unknown, _inputBuffer: unknown, deltaTime = 0) {
		if (this.autoTime) {
			this.uniforms.get('uTime')!.value += deltaTime;
		}
	}

	/** Enables or disables automatic time progression. */
	setAutoTime(value: boolean) {
		this.autoTime = value;
	}

	/** Current transition progress. */
	get progress(): number {
		return this.uniforms.get('uProgress')!.value;
	}

	/** Updates the transition progress, taking effect on the next render. */
	set progress(value: number) {
		this.uniforms.get('uProgress')!.value = value;
	}

	/** Current internal time value. */
	get time(): number {
		return this.uniforms.get('uTime')!.value;
	}

	/** Updates the internal time uniform manually. */
	set time(value: number) {
		this.uniforms.get('uTime')!.value = value;
	}
}
