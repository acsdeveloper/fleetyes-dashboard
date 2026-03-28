import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
}

/**
 * Deduplicate an array by a key field or composite key function.
 * Last-write-wins when duplicates are found.
 * Use this at every API data load point to prevent duplicate dropdown options.
 *
 * Examples:
 *   dedupBy(drivers, "uuid")                            // by single field
 *   dedupBy(drivers, (d) => `${d.name}|${d.phone}`)    // composite key
 */
export function dedupBy<T>(arr: T[], key: keyof T | ((item: T) => string)): T[] {
  const getKey = typeof key === "function" ? key : (item: T) => String(item[key])
  return Array.from(new Map(arr.map((item) => [getKey(item), item])).values())
}
