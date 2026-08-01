import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class using clsx with tailwind merge
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}
