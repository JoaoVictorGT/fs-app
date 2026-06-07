/**
 * Returns the ISO 8601 week string for a given date.
 * Format: "YYYY-WNN" (e.g. "2025-W23")
 */
export function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayOfWeek = d.getUTCDay() || 7; // Mon=1 … Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - dayOfWeek); // nearest Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/** Returns the Monday (UTC midnight) of an ISO week string. */
export function getMondayOfWeek(weekStr: string): Date {
  const [yearStr, weekPart] = weekStr.split('-W');
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekPart, 10);
  const jan4 = new Date(Date.UTC(year, 0, 4)); // Jan 4 is always in week 1
  const jan4Day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1) + (week - 1) * 7);
  return monday;
}

/**
 * Returns true when `previous` is exactly the week before `current`.
 */
export function isConsecutiveWeek(current: string, previous: string): boolean {
  const currMonday = getMondayOfWeek(current);
  const prevMonday = getMondayOfWeek(previous);
  const diffDays = Math.round(
    (currMonday.getTime() - prevMonday.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diffDays === 7;
}

/** Returns all ISO week strings that overlap with a given month (YYYY-MM). */
export function getWeeksInMonth(year: number, month: number): string[] {
  const weeks = new Set<string>();
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    weeks.add(getISOWeek(new Date(year, month - 1, d)));
  }
  return Array.from(weeks).sort();
}
