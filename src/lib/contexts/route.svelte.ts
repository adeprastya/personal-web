import { afterNavigate } from '$app/navigation';
import { AppRoute } from '$lib/types/Route';

export const routeData = $state({
	from: '' as string,
	to: '' as string,
	current: '' as string
});

export function initRoute() {
	afterNavigate(({ from, to }) => {
		routeData.from = from?.url.pathname ?? AppRoute.home;
		routeData.to = to?.url.pathname ?? AppRoute.home;
		routeData.current = to?.url.pathname ?? AppRoute.home;
	});
}
