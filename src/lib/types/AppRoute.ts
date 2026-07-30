export const AppRoute = {
	Home: '/',
	About: '/about',
	Works: '/works'
} as const;

export type AppRouteType = (typeof AppRoute)[keyof typeof AppRoute];
