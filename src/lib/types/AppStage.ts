import { PUBLIC_ENV } from '$env/static/public';

export const AppStage = {
	DEVELOPMENT: 'dev',
	PRODUCTION: 'prod'
} as const;

export type AppStage = (typeof AppStage)[keyof typeof AppStage];

export const isDev = () => PUBLIC_ENV === AppStage.DEVELOPMENT;
export const isProd = () => PUBLIC_ENV === AppStage.PRODUCTION;
