import { afterNavigate } from '$app/navigation';
import { type AppRouteType, AppRoute } from '$lib/types/Route';

class RouteState {
	private initialized = false;

	public from = $state<AppRouteType>(AppRoute.Home);
	public to = $state<AppRouteType>(AppRoute.Home);
	public current = $state<AppRouteType>(AppRoute.Home);

	/**
	 * Initialize the state
	 *
	 * Must be called once in runtime before accessing the property
	 */
	init() {
		if (this.initialized) return;
		this.initialized = true;

		// Listen to route changes
		afterNavigate(({ from, to }) => {
			this.from = (from?.url.pathname ?? AppRoute.Home) as AppRouteType;
			this.to = (to?.url.pathname ?? AppRoute.Home) as AppRouteType;
			this.current = (to?.url.pathname ?? AppRoute.Home) as AppRouteType;
		});
	}
}

export const route = new RouteState();
