/**
 * Represents a horizontal ring of evenly-spaced positions for a given set of items.
 * Item count is derived from `items.length` on every call, so it
 * stays correct even if the underlying array is mutated or reassigned.
 */
export class CircularItems<T> {
	constructor(
		private items: T[],
		public radius: number,
		public startAngle: number = 0.1
	) {}

	/** Computes the `[x, y, z]` position of slot `i` on this ring at height `y`. */
	positionOf(i: number, y: number): [number, number, number] {
		const total = this.items.length;
		const angle = this.startAngle + (i * Math.PI * 2) / total;
		return [this.radius * Math.cos(angle), y, this.radius * Math.sin(angle)];
	}

	/** Computes positions for every item in the array at height `y`. */
	allPositions(y: number): Array<[number, number, number]> {
		return this.items.map((_, i) => this.positionOf(i, y));
	}
}
