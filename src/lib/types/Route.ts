export type AppRoute = 'home' | 'works' | 'about' | 'contact';

export const AppRoute = {
	home: '/home',
	about: '/about',
	works: '/works'
} as const;
