import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Échappe les jokers `%`, `_` et `\` pour un filtre `ilike` exact
 * (le slug est comparé sans tenir compte de la casse, jamais en motif).
 */
export function likeExact(value: string) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`)
}
