import { MathUtils } from 'three';

export function trapezoid(t: number, a = 0.4, b = 0.6, min = 0, max = 0.75) {
	t = MathUtils.clamp(t, 0, 1);
	if (t < a) return MathUtils.lerp(min, max, t / a);
	if (t <= b) return max;
	return MathUtils.lerp(max, min, (t - b) / (1 - b));
}
