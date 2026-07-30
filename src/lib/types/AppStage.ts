export const AppStage = {
	DEVELOPMENT: 'dev',
	PRODUCTION: 'prod'
} as const;

export type AppStage = (typeof AppStage)[keyof typeof AppStage];
