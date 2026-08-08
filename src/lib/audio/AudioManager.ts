import { Howl } from 'howler';

interface PlayOptions {
	volume?: number;
	rate?: number;
	loop?: boolean;
	/** Kalau true dan sound sedang playing, tidak start instance baru (buat BGM/loop). */
	skipIfPlaying?: boolean;
}

export class AudioManager<T extends Record<string, string>> {
	private sounds = new Map<keyof T, Howl>();

	constructor(sources: T) {
		this.sounds = new Map(
			Object.entries(sources).map(([name, src]) => [
				name as keyof T,
				new Howl({ src: [src], preload: true, html5: false })
			])
		);
	}

	/**
	 * Akses langsung instance Howl. Untuk kontrol per-instance (volume, rate,
	 * loop, playing, pause, stop by id, dst) pakai API Howler ini, jangan
	 * dibungkus ulang di sini.
	 */
	get(name: keyof T): Howl | undefined {
		return this.sounds.get(name);
	}

	/**
	 * Play satu sound. Mencakup kasus one-shot, overlap (banyak instance),
	 * dan loop/stream (dengan skipIfPlaying) lewat opsi, bukan method terpisah.
	 */
	play(
		name: keyof T,
		{ volume = 1, rate = 1, loop = false, skipIfPlaying = false }: PlayOptions = {}
	): number | undefined {
		const sound = this.get(name);
		if (!sound) return;

		if (skipIfPlaying && sound.playing()) return;

		const id = sound.play();
		sound.volume(volume, id);
		sound.rate(rate, id);
		if (loop) sound.loop(true, id);
		return id;
	}

	playWithFade(
		name: keyof T,
		{
			volume = 1,
			rate = 1,
			loop = false,
			skipIfPlaying = false,
			duration = 1000
		}: PlayOptions & { duration?: number } = {}
	) {
		const sound = this.get(name);
		if (!sound) return;

		if (skipIfPlaying && sound.playing()) return;

		sound.play();
		sound.volume(0);
		sound.rate(rate);
		sound.loop(loop);
		sound.fade(0, volume, duration);
	}

	/**
	 * Fade lalu stop, pakai event 'fade' bawaan Howler alih-alih setTimeout
	 * (lebih akurat karena nunggu fade beneran selesai, bukan estimasi durasi).
	 */
	stopWithFade(name: keyof T, duration = 150, id?: number): void {
		const sound = this.get(name);
		if (!sound || !id) return;

		const from = sound.volume(id) as number;
		sound.fade(from, 0, duration, id);
		sound.once(
			'fade',
			() => {
				sound.stop(id);
				sound.volume(from, id);
			},
			id
		);
	}

	muteAll(): void {
		this.sounds.forEach((sound) => sound.mute(true));
	}

	unmuteAll(): void {
		this.sounds.forEach((sound) => sound.mute(false));
	}

	playAll(): void {
		this.sounds.forEach((sound) => {
			if (!sound.playing()) sound.play();
		});
	}

	stopAll(): void {
		this.sounds.forEach((sound) => sound.stop());
	}
}
