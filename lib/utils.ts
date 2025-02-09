import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateDays(
  startDate: Date,
  endDate: Date,
  startPart: number,
  endPart: number
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  if (daysDiff === 1) {
    if (startPart === 2 || endPart === 3) {
      return 0.5;
    }
    return 1;
  }

  let totalDays = daysDiff;

  // Adjust for partial first day
  if (startPart === 2) {
    totalDays -= 0.5;
  }

  // Adjust for partial last day
  if (endPart === 3) {
    totalDays -= 0.5;
  }

  return totalDays;
}
