import { AudioManager } from '$lib/audio/AudioManager';
import AmbientHigh from '$lib/assets/sounds/musical-ambient-pads-loop-02-427399.mp3';
import AmbientLow from '$lib/assets/sounds/film-special-effects-sci-fi-elements-ambience-low-230538.mp3';
import Click from '$lib/assets/sounds/film-special-effects-ui-click-menu-modern-interface-select-medium-230477.mp3';
import Expand from '$lib/assets/sounds/film-special-effects-ui-movement-menu-modern-interface-hover-large-230487.mp3';
import SoftClick from '$lib/assets/sounds/juniorsoundays-ui-sound-73-527841.mp3';
import Hover from '$lib/assets/sounds/juniorsoundays-ui-sound-14-527823.mp3';
import Wind from '$lib/assets/sounds/freesound_community-windloop6sec-90673.mp3';

export const sounds = {
	AmbientHigh,
	AmbientLow,
	SoftClick,
	Click,
	Expand,
	Hover,
	Wind
} as const;
export const audio = new AudioManager<typeof sounds>(sounds);

export const audios = {
	introClicking: () => {
		audio.playWithFade('SoftClick', { volume: 1, loop: false, duration: 150 });
		audio.playWithFade('AmbientHigh', { volume: 0.1, loop: true, duration: 4000 });
		audio.playWithFade('AmbientLow', { volume: 0.1, loop: true, duration: 4000 });
	},

	CTAHovering: () => audio.play('Hover', { volume: 0.7, rate: 0.7 }),
	CTAClicking: () => audio.play('Click'),
	CTAExpanding: () => audio.play('Expand', { volume: 0.5, rate: 1.6 }),

	messageExpanding: () => audio.play('Expand', { volume: 0.4, rate: 0.9 }),

	soundClicking: () => audio.play('SoftClick'),

	linkHovering: () => audio.play('Hover', { volume: 0.7, rate: 0.9 }),

	navClicking: () => audio.play('Click', { volume: 0.5, rate: 1.2, skipIfPlaying: false }),

	projectItemSwitching: () =>
		audio.play('SoftClick', { volume: 0.5, rate: 1.6, skipIfPlaying: false }),
	projectItemVisible: () => {
		audio.play('Click', { volume: 0.5, rate: 0.6, skipIfPlaying: false });

		audio.stopWithFade('AmbientHigh', 2000);
		audio.stopWithFade('AmbientLow', 2000);

		audio.playWithFade('AmbientHigh', { volume: 0.1, rate: 2.6, loop: true, duration: 2000 });
		audio.playWithFade('AmbientLow', { volume: 0.1, rate: 2.8, loop: true, duration: 2000 });
	},
	projectItemHidden: () => {
		audio.play('Click', { volume: 0.5, rate: 0.6, skipIfPlaying: false });

		audio.stopWithFade('AmbientHigh', 2000);
		audio.stopWithFade('AmbientLow', 2000);

		audio.playWithFade('AmbientHigh', { volume: 0.1, loop: true, duration: 2000 });
		audio.playWithFade('AmbientLow', { volume: 0.1, loop: true, duration: 2000 });
	},

	pointerMove: () => audio.play('Wind', { volume: 0.0, loop: true })
};
