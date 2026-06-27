import { clsx } from 'clsx';

export function cn(...values: Parameters<typeof clsx>) {
  return clsx(values);
}