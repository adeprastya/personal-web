import { clamp } from './basic';

/**
 * Evaluates an asymmetric Gaussian bell curve at `v`, peaking at `peak`
 * with value 1. The curve uses `sigmaUp` to control the spread on the
 * rising side (v < peak) and `sigmaDown` for the falling side (v >= peak),
 * allowing a skewed (non-symmetric) bell shape.
 *
 * `v` is clamped to [0, 1] before evaluation.
 *
 * @param v - Input value, typically progress in [0, 1].
 * @param peak - Location of the curve's peak (value 1), typically in [0, 1].
 * @param sigmaUp - Standard deviation controlling spread for v < peak.
 * @param sigmaDown - Standard deviation controlling spread for v >= peak.
 * @returns A value in (0, 1], where 1 occurs at v === peak.
 */
export function asymmetricBell(
	v: number,
	peak: number,
	sigmaUp: number,
	sigmaDown: number
): number {
	const sigma = v < peak ? sigmaUp : sigmaDown;
	if (sigma <= 0) return v === peak ? 1 : 0;

	const clampedV = clamp(v, 0, 1);
	const exponent = -Math.pow((clampedV - peak) / sigma, 2) / 2;
	return Math.exp(exponent);
}
