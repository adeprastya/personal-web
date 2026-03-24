export const deviceData = $state({
	isMobile: false as boolean,
	isMatchMediaMobile: false as boolean,
	hasTouch: false as boolean,
	isInitialized: false as boolean
});

export function initDevice() {
	if (typeof window === 'undefined' || deviceData.isInitialized) return;

	// Touch
	deviceData.hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

	// User agent
	if ('userAgentData' in navigator) {
		deviceData.isMobile = (
			navigator as Navigator & { userAgentData: { mobile: boolean } }
		).userAgentData.mobile;
	} else {
		deviceData.isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
	}

	// Match media
	const mediaQuery = window.matchMedia('(max-width: 768px) and (pointer: coarse)');
	deviceData.isMatchMediaMobile = mediaQuery.matches;

	const handler = (e: MediaQueryListEvent) => {
		deviceData.isMatchMediaMobile = e.matches;
	};

	mediaQuery.addEventListener('change', handler);

	deviceData.isInitialized = true;
	return () => mediaQuery.removeEventListener('change', handler);
}
