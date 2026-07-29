import { WEEKS, ALL_TOPICS, findTopicById } from './data';
import type { Topic } from './types';

export type Side = 'weekday' | 'weekend';
export type Position = { week: string; side: Side }; // week is 'W1'..'W10'
export type OverrideMap = Record<string, Position[]>; // topicId → positions[]

// ─── Parse helpers ────────────────────────────────────────────────────────────

function parseTopicIds(text: string): string[] {
  return (text.match(/\((\d+\.\d+)\)/g) ?? []).map(m => m.slice(1, -1));
}

/** Parse a topic.week field into ordered week numbers. */
export function parseWeekField(w: string): number[] {
  if (/^W\d+$/.test(w)) return [parseInt(w.slice(1))];
  const range = w.match(/^W(\d+)[–\-](\d+)$/);
  if (range) {
    const out: number[] = [];
    for (let i = parseInt(range[1]); i <= parseInt(range[2]); i++) out.push(i);
    return out;
  }
  if (/^W\d+(,\d+)+$/.test(w)) return w.slice(1).split(',').map(Number);
  return [];
}

// ─── Per-topic canonical assignment (first-occurrence-wins) ───────────────────

const ASSIGNMENT: Record<string, Side> = (() => {
  const map: Record<string, Side> = {};
  WEEKS.forEach(w => {
    parseTopicIds(w.weekday).forEach(id => { if (!map[id]) map[id] = 'weekday'; });
    parseTopicIds(w.weekend).forEach(id => { if (!map[id]) map[id] = 'weekend'; });
  });
  return map;
})();

/** Default side for a pill of `topicId` in week `weekNum` — matches the current
 *  ScheduleView.getTopicsForWeek behaviour: explicit WEEKS text placement wins,
 *  else the topic's canonical ASSIGNMENT, else weekday. */
function defaultSideForPill(topicId: string, weekNum: number): Side {
  const w = WEEKS[weekNum - 1];
  if (!w) return ASSIGNMENT[topicId] ?? 'weekday';
  if (parseTopicIds(w.weekday).includes(topicId)) return 'weekday';
  if (parseTopicIds(w.weekend).includes(topicId)) return 'weekend';
  return ASSIGNMENT[topicId] ?? 'weekday';
}

/** Default positions for a topic — one entry per week it spans. */
export function defaultPositions(topic: Topic): Position[] {
  return parseWeekField(topic.week).map(n => ({
    week: `W${n}`,
    side: defaultSideForPill(topic.id, n),
  }));
}

// ─── Effective positions with override applied ────────────────────────────────

export function getEffectivePositions(topic: Topic, overrides: OverrideMap): Position[] {
  return overrides[topic.id] ?? defaultPositions(topic);
}

/** Ordered week numbers a topic effectively occupies. */
export function getEffectiveWeekNums(topic: Topic, overrides: OverrideMap): number[] {
  return getEffectivePositions(topic, overrides).map(p => parseInt(p.week.slice(1)));
}

export function getEffectiveStartWeek(topic: Topic, overrides: OverrideMap): number {
  const nums = getEffectiveWeekNums(topic, overrides);
  return nums.length ? Math.min(...nums) : 99;
}

export function getEffectiveEndWeek(topic: Topic, overrides: OverrideMap): number {
  const nums = getEffectiveWeekNums(topic, overrides);
  return nums.length ? Math.max(...nums) : 99;
}

/** Human-readable label for an effective schedule — contiguous ranges collapsed.
 *  [1,2] → 'W1–2', [1,3,5] → 'W1,3,5', [3] → 'W3'. */
export function formatEffectiveWeekLabel(positions: Position[]): string {
  const nums = positions.map(p => parseInt(p.week.slice(1))).sort((a, b) => a - b);
  if (nums.length === 0) return '';
  if (nums.length === 1) return `W${nums[0]}`;
  const isContiguous = nums.every((n, i) => i === 0 || n === nums[i - 1] + 1);
  if (isContiguous) return `W${nums[0]}–${nums[nums.length - 1]}`;
  return `W${nums.join(',')}`;
}

// ─── Per-week rollup for ScheduleView ─────────────────────────────────────────

export type PillRef = { topicId: string; positionIndex: number };
export type WeekBucket = { weekdayPills: PillRef[]; weekendPills: PillRef[] };

/** Group all topics' effective pills by (weekNum, side). */
export function buildWeekBuckets(overrides: OverrideMap): Record<number, WeekBucket> {
  const buckets: Record<number, WeekBucket> = {};
  for (let n = 1; n <= WEEKS.length; n++) {
    buckets[n] = { weekdayPills: [], weekendPills: [] };
  }
  for (const topic of ALL_TOPICS) {
    const positions = getEffectivePositions(topic, overrides);
    positions.forEach((p, positionIndex) => {
      const n = parseInt(p.week.slice(1));
      if (!buckets[n]) return;
      const bucket = p.side === 'weekday' ? buckets[n].weekdayPills : buckets[n].weekendPills;
      bucket.push({ topicId: topic.id, positionIndex });
    });
  }
  return buckets;
}

/** Hours a pill contributes in a single week (topic.hours / number of pills). */
export function pillHours(topicId: string, overrides: OverrideMap): number {
  const topic = findTopicById(topicId);
  if (!topic) return 0;
  const positions = getEffectivePositions(topic, overrides);
  const n = positions.length || 1;
  return n > 1 ? Math.ceil(topic.hours / n) : topic.hours;
}

/** Sum hours for a set of pills. */
export function sumPillHours(pills: PillRef[], overrides: OverrideMap): number {
  return pills.reduce((s, p) => s + pillHours(p.topicId, overrides), 0);
}

// ─── Autoplace on drop ────────────────────────────────────────────────────────

/** Given a target week's current buckets and the pill's current side, decide
 *  which side the pill lands on. Less-loaded side wins; ties keep the pill's
 *  current side. */
export function autoplaceSide(
  target: WeekBucket,
  currentSide: Side,
  overrides: OverrideMap,
): Side {
  const weekdayH = sumPillHours(target.weekdayPills, overrides);
  const weekendH = sumPillHours(target.weekendPills, overrides);
  if (weekdayH < weekendH) return 'weekday';
  if (weekendH < weekdayH) return 'weekend';
  return currentSide;
}
