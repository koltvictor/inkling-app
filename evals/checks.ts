// Case-insensitive substring matching for must-mention items.
// Supports "A OR B OR C" semantics: hit if any alternative matches.
export function checkMustMention(text: string, items: string[]): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  const lower = text.toLowerCase();
  for (const item of items) {
    const alternatives = item
      .split(' OR ')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0);
    result[item] = alternatives.some((alt) => lower.includes(alt));
  }
  return result;
}

// Each item is a literal phrase that must NOT appear (case-insensitive substring).
export function checkMustAvoid(text: string, items: string[]): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  const lower = text.toLowerCase();
  for (const item of items) {
    result[item] = lower.includes(item.toLowerCase());
  }
  return result;
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

export function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function stddev(nums: number[]): number {
  if (nums.length === 0) return 0;
  const m = mean(nums);
  const sq = nums.map((n) => (n - m) ** 2);
  return Math.sqrt(mean(sq));
}
