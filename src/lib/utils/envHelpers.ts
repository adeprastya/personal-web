/**
 * Cast string boolean value into real boolean
 */
export function booleanCast(val: string): boolean {
	return ['true', '1'].includes(val.toLowerCase());
}
