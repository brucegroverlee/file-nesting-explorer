import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function indentFor(depth: number): number {
  // 12px per level feels right at 13px font size.
  return 4 + depth * 12;
}
