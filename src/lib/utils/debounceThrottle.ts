/*
// Basic debounce example
const debouncedSearch = debounce((query: string): void => {
  console.log('Searching for:', query);
  // Perform search API call
}, 300);

// Basic throttle example
const throttledScroll = throttle((): void => {
  console.log('Scroll position:', window.scrollY);
}, 100);
*/

type AnyFunction = (...args: unknown[]) => unknown;

interface DebouncedFunction<T extends AnyFunction> {
	(...args: Parameters<T>): ReturnType<T> | undefined;
	cancel(): void;
	flush(): ReturnType<T> | undefined;
}

interface ThrottledFunction<T extends AnyFunction> {
	(...args: Parameters<T>): ReturnType<T> | undefined;
	cancel(): void;
}

/**
 * Debounce function - delays execution until after wait time has elapsed since last call
 * Perfect for search inputs, resize events, or any rapid user input
 *
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @param immediate - Whether to execute on leading edge instead of trailing
 * @returns The debounced function
 */
export function debounce<T extends AnyFunction>(
	func: T,
	wait: number,
	immediate: boolean = false
): DebouncedFunction<T> {
	let timeout: ReturnType<typeof setTimeout> | undefined;
	let result: ReturnType<T> | undefined;

	function executedFunction(this: unknown, ...args: Parameters<T>): ReturnType<T> | undefined {
		const later = (): void => {
			timeout = undefined;
			if (!immediate) result = func.apply(this, args) as ReturnType<T>;
		};

		const callNow = immediate && !timeout;

		clearTimeout(timeout);
		timeout = setTimeout(later, wait);

		if (callNow) result = func.apply(this, args) as ReturnType<T>;
		return result;
	}

	executedFunction.cancel = (): void => {
		clearTimeout(timeout);
		timeout = undefined;
	};

	executedFunction.flush = (): ReturnType<T> | undefined => {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		return result;
	};

	return executedFunction as DebouncedFunction<T>;
}

/**
 * Throttle function - ensures function is called at most once per specified time period
 * Perfect for scroll events, button clicks, or API calls that need rate limiting
 *
 * @param func - The function to throttle
 * @param limit - The number of milliseconds between calls
 * @param leading - Whether to execute on the leading edge (default: true)
 * @param trailing - Whether to execute on the trailing edge (default: true)
 * @returns The throttled function
 */
export function throttle<T extends AnyFunction>(
	func: T,
	limit: number,
	leading: boolean = true,
	trailing: boolean = true
): ThrottledFunction<T> {
	let inThrottle: boolean = false;
	let lastFunc: ReturnType<typeof setTimeout> | undefined;
	let lastRan: number | undefined;
	let result: ReturnType<T> | undefined;

	const executedFunction = function (
		this: unknown,
		...args: Parameters<T>
	): ReturnType<T> | undefined {
		if (!inThrottle) {
			if (leading) result = func.apply(this, args) as ReturnType<T>;
			lastRan = Date.now();
			inThrottle = true;
		} else {
			clearTimeout(lastFunc);
			lastFunc = setTimeout(
				() => {
					if (lastRan && Date.now() - lastRan >= limit) {
						if (trailing) result = func.apply(this, args) as ReturnType<T>;
						lastRan = Date.now();
					}
				},
				limit - (Date.now() - (lastRan || 0))
			);
		}
		return result;
	};

	executedFunction.cancel = (): void => {
		clearTimeout(lastFunc);
		inThrottle = false;
		lastFunc = undefined;
		lastRan = undefined;
	};

	return executedFunction as ThrottledFunction<T>;
}
