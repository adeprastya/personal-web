class DeviceState {
	private initialized = false;

	private mediaQuery: MediaQueryList | null = null;

	public isMobile = $state<boolean>(false);
	public isMatchMediaMobile = $state<boolean>(false);
	public hasTouch = $state<boolean>(false);
	public prefersReducedMotion = $state<boolean>(false);

	/**
	 * Initialize the state
	 *
	 * Must be called once in runtime before accessing the property
	 */
	init() {
		if (typeof window === 'undefined' || this.initialized) return;

		// Detect touch support
		this.hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

		// Detect mobile device
		if ('userAgentData' in navigator) {
			this.isMobile = (
				navigator as Navigator & {
					userAgentData: { mobile: boolean };
				}
			).userAgentData.mobile;
		} else {
			this.isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
		}

		this.prefersReducedMotion = !!(
			'matchMedia' in window && window.matchMedia('(prefers-reduced-motion: reduce)').matches
		);

		// Track viewport changes
		const mediaQuery = window.matchMedia('(max-width: 768px) and (pointer: coarse)');
		this.isMatchMediaMobile = mediaQuery.matches;

		mediaQuery.addEventListener('change', this.handleMediaQueryChange);

		this.initialized = true;
	}

	/**
	 * Destroy the state
	 */
	destroy() {
		if (!this.initialized || !this.mediaQuery) return;

		this.mediaQuery.removeEventListener('change', this.handleMediaQueryChange);

		this.mediaQuery = null;
		this.initialized = false;
	}

	// Media query event handlers
	private handleMediaQueryChange = (e: MediaQueryListEvent) => {
		this.isMatchMediaMobile = e.matches;
	};
}

export const device = new DeviceState();
