export function typingAnimation(
	initialStr: string,
	finalStr: string,
	onUpdate: (current: string) => void,
	{ delay = 100 } = {}
) {
	const initialArr = initialStr.split('');
	const targetArr = finalStr.split('');

	let cancelled = false;
	let stepIndex = 0;
	let phase: 'erase' | 'type' = 'erase';
	const current: string[] = [...initialArr];

	function step() {
		if (cancelled) return;

		if (phase === 'erase') {
			if (current.length > 0) {
				current.pop();
				onUpdate(current.join(''));
				setTimeout(step, delay);
			} else {
				phase = 'type';
				stepIndex = 0;
				setTimeout(step, delay);
			}
		} else if (phase === 'type') {
			if (stepIndex < targetArr.length) {
				current.push(targetArr[stepIndex]);
				stepIndex++;
				onUpdate(current.join(''));
				setTimeout(step, delay);
			} else {
				onUpdate(finalStr);
			}
		}
	}

	step();

	return {
		cancel() {
			cancelled = true;
		}
	};
}
