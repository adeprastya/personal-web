import { afterNavigate } from '$app/navigation';
import { type AppRouteType, AppRoute } from '$lib/types/AppRoute';

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
	init(): void {
		if (this.initialized) return;
		this.initialized = true;

		// Listen to route changes
		afterNavigate(({ from, to }) => {
			this.from = (from?.url.pathname ?? AppRoute.Home) as AppRouteType;
			this.to = (to?.url.pathname ?? AppRoute.Home) as AppRouteType;
			this.current = (to?.url.pathname ?? AppRoute.Home) as AppRouteType;
		});
	}

	/**
	 * Returns the current progress only when the given route is active.
	 *
	 * @param route Target application route.
	 */
	is(route: AppRouteType): boolean {
		return this.current === route;
	}
}

export const route = new RouteState();
