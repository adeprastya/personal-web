export const AppRoute = {
	home: '/',
	about: '/about',
	works: '/works'
} as const;

export type Route = (typeof AppRoute)[keyof typeof AppRoute];
