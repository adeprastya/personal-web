import { afterNavigate } from '$app/navigation';

export const routeData = $state({
	from: '' as string,
	to: '' as string,
	current: '' as string
});

export function initRoute() {
	afterNavigate(({ from, to }) => {
		routeData.from = from?.url.pathname ?? '/';
		routeData.to = to?.url.pathname ?? '/';
		routeData.current = to?.url.pathname ?? '/';
	});
}
