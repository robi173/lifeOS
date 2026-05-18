// ============================================================
// habits.svelte.ts – LifeOS Habits Engine
// ============================================================

const HABITS_KEY = 'lifeos_habits';

// ── Types ────────────────────────────────────────────────────

/** 0 = Monday, 1 = Tuesday … 6 = Sunday (ISO weekday - 1) */
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface HabitDef {
  id: string;
  title: string;
  activeDays: WeekDay[];  // empty = all days
  createdAt: string;      // YYYY-MM-DD
}

/** history[habitId][YYYY-MM-DD] = true (done) | false (missed/skipped) */
export type HabitHistory = Record<string, Record<string, boolean>>;

export interface HabitsData {
  habits: HabitDef[];
  history: HabitHistory;
  todayDate: string;        // last seen date – triggers reset when changed
  todayCompleted: string[]; // habit IDs ticked today
  weekScores: Record<string, { done: number; total: number }>;
}

// ── Date helpers ─────────────────────────────────────────────

export function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function today(): string {
  return toDateStr(new Date());
}

/** 0 = Monday … 6 = Sunday */
export function isoWeekDay(dateStr: string): WeekDay {
  const d = new Date(dateStr + 'T12:00:00');
  return ((d.getDay() + 6) % 7) as WeekDay;
}

/** Returns YYYY-MM-DD for Monday of the week containing dateStr */
export function mondayOfWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return toDateStr(d);
}

/** Adds N days to a YYYY-MM-DD string */
export function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

/** Returns all dates from start (inclusive) to end (exclusive) */
export function daysBetween(start: string, end: string): string[] {
  const result: string[] = [];
  let cur = start;
  while (cur < end) {
    result.push(cur);
    cur = addDays(cur, 1);
  }
  return result;
}

export function isHabitActiveOnDay(habit: HabitDef, dateStr: string): boolean {
  if (!habit.activeDays || habit.activeDays.length === 0) return true;
  return habit.activeDays.includes(isoWeekDay(dateStr));
}

// ── Streak calculation ────────────────────────────────────────

export function calcStreak(habit: HabitDef, history: HabitHistory, fromDate: string): number {
  const hHistory = history[habit.id] ?? {};
  let streak = 0;
  let d = addDays(fromDate, -1); // start from yesterday

  for (let i = 0; i < 365; i++) {
    if (!isHabitActiveOnDay(habit, d)) {
      // Skip inactive days — don't break streak
      d = addDays(d, -1);
      continue;
    }
    if (hHistory[d] === true) {
      streak++;
      d = addDays(d, -1);
    } else {
      break;
    }
  }
  return streak;
}

// ── Consistency pills (last 5 active days) ───────────────────

export function getConsistencyPills(
  habit: HabitDef,
  history: HabitHistory,
  fromDate: string
): boolean[] {
  const hHistory = history[habit.id] ?? {};
  const pills: boolean[] = [];
  let d = addDays(fromDate, -1);

  for (let i = 0; i < 60 && pills.length < 5; i++) {
    if (isHabitActiveOnDay(habit, d)) {
      pills.push(hHistory[d] === true);
    }
    d = addDays(d, -1);
  }

  // Pad with false if not enough history
  while (pills.length < 5) pills.push(false);
  return pills.reverse(); // oldest → newest
}

// ── Week progress (Mon–Sun of current week) ──────────────────

export interface WeekDay7 {
  label: string;     // M, T, W …
  dateStr: string;
  isPast: boolean;
  isToday: boolean;
  isFuture: boolean;
  perfect: boolean;  // 100% that day
  partial: boolean;  // some done, not all
  hasHabits: boolean;
}

export function getWeekProgress(
  habits: HabitDef[],
  weekScores: Record<string, { done: number; total: number }>,
  todayCompleted: string[],
  todayDateStr: string
): WeekDay7[] {
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const monday = mondayOfWeek(todayDateStr);
  const result: WeekDay7[] = [];

  for (let i = 0; i < 7; i++) {
    const dateStr = addDays(monday, i);
    const isToday = dateStr === todayDateStr;
    const isPast = dateStr < todayDateStr;
    const isFuture = dateStr > todayDateStr;

    let perfect = false;
    let partial = false;
    let hasHabits = false;

    if (isToday) {
      const activeHabits = habits.filter(h => isHabitActiveOnDay(h, dateStr));
      hasHabits = activeHabits.length > 0;
      const doneCount = todayCompleted.filter(id => activeHabits.some(h => h.id === id)).length;
      perfect = hasHabits && doneCount === activeHabits.length;
      partial = hasHabits && doneCount > 0 && !perfect;
    } else if (isPast) {
      const score = weekScores[dateStr];
      if (score && score.total > 0) {
        hasHabits = true;
        perfect = score.done === score.total;
        partial = score.done > 0 && !perfect;
      }
    }

    result.push({ label: labels[i], dateStr, isPast, isToday, isFuture, perfect, partial, hasHabits });
  }

  return result;
}

// ── Persist / Load ───────────────────────────────────────────

function persist(data: HabitsData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(HABITS_KEY, JSON.stringify(data));
  }
}

function load(): HabitsData {
  if (typeof window === 'undefined') {
    return createDefault();
  }
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    if (raw) return JSON.parse(raw) as HabitsData;
  } catch { /* corrupted */ }
  return createDefault();
}

function createDefault(): HabitsData {
  const t = today();
  return {
    habits: [
      { id: 'h1', title: 'Cold Shower', activeDays: [], createdAt: t },
      { id: 'h2', title: 'Read 20 Pages', activeDays: [], createdAt: t },
      { id: 'h3', title: 'Meditation', activeDays: [], createdAt: t },
      { id: 'h4', title: 'Morning Exercise', activeDays: [0, 1, 2, 3, 4], createdAt: t },
    ],
    history: {},
    todayDate: t,
    todayCompleted: [],
    weekScores: {},
  };
}

// ── Day transition logic ──────────────────────────────────────

function processNewDay(data: HabitsData, newDate: string): HabitsData {
  const missedDays = daysBetween(data.todayDate, newDate);

  for (const day of missedDays) {
    // Freeze the snapshot for this day
    const activeHabits = data.habits.filter(h => isHabitActiveOnDay(h, day));
    const done = day === data.todayDate
      ? data.todayCompleted.filter(id => activeHabits.some(h => h.id === id)).length
      : 0; // user was offline — count as 0

    data.weekScores[day] = { done, total: activeHabits.length };

    // Write to history
    for (const habit of activeHabits) {
      if (!data.history[habit.id]) data.history[habit.id] = {};
      data.history[habit.id][day] = day === data.todayDate
        ? data.todayCompleted.includes(habit.id)
        : false; // missed
    }
  }

  data.todayDate = newDate;
  data.todayCompleted = [];
  return data;
}

// ── Reactive Store ────────────────────────────────────────────

let _data = load();
const _today = today();

if (_data.todayDate !== _today) {
  _data = processNewDay(_data, _today);
  persist(_data);
}

export const habitsStore = $state({
  habits: _data.habits as HabitDef[],
  history: _data.history as HabitHistory,
  todayDate: _data.todayDate,
  todayCompleted: _data.todayCompleted as string[],
  weekScores: _data.weekScores as Record<string, { done: number; total: number }>,

  // ── Computed properties ──────────────────────────────────

  get activeHabitsToday(): HabitDef[] {
    return this.habits.filter(h => isHabitActiveOnDay(h, this.todayDate));
  },

  get dailyScore(): number {
    const active = this.activeHabitsToday;
    if (active.length === 0) return 0;
    const done = this.todayCompleted.filter(id => active.some(h => h.id === id)).length;
    return Math.round((done / active.length) * 100);
  },

  // ── Actions ──────────────────────────────────────────────

  _save() {
    persist({
      habits: this.habits,
      history: this.history,
      todayDate: this.todayDate,
      todayCompleted: this.todayCompleted,
      weekScores: this.weekScores,
    });
  },

  checkDayChange() {
    const t = today();
    if (t !== this.todayDate) {
      const updated = processNewDay({
        habits: this.habits,
        history: this.history,
        todayDate: this.todayDate,
        todayCompleted: this.todayCompleted,
        weekScores: this.weekScores,
      }, t);
      this.todayDate = updated.todayDate;
      this.todayCompleted = updated.todayCompleted;
      this.history = updated.history;
      this.weekScores = updated.weekScores;
      this._save();
    }
  },

  toggleHabit(id: string) {
    if (!isHabitActiveOnDay(this.habits.find(h => h.id === id)!, this.todayDate)) return;
    const idx = this.todayCompleted.indexOf(id);
    if (idx === -1) {
      this.todayCompleted = [...this.todayCompleted, id];
    } else {
      this.todayCompleted = this.todayCompleted.filter(i => i !== id);
    }
    this._save();
  },

  addHabit(title: string, activeDays: WeekDay[]) {
    const newHabit: HabitDef = {
      id: `h-${Date.now()}`,
      title: title.trim(),
      activeDays,
      createdAt: this.todayDate,
    };
    this.habits = [...this.habits, newHabit];
    this._save();
  },

  editHabit(id: string, title: string, activeDays: WeekDay[]) {
    this.habits = this.habits.map(h =>
      h.id === id ? { ...h, title: title.trim(), activeDays } : h
    );
    this._save();
  },

  deleteHabit(id: string) {
    this.habits = this.habits.filter(h => h.id !== id);
    this.todayCompleted = this.todayCompleted.filter(i => i !== id);
    this._save();
  },

  getStreak(habitId: string): number {
    const habit = this.habits.find(h => h.id === habitId);
    if (!habit) return 0;
    return calcStreak(habit, this.history, this.todayDate);
  },

  getPills(habitId: string): boolean[] {
    const habit = this.habits.find(h => h.id === habitId);
    if (!habit) return [false, false, false, false, false];
    return getConsistencyPills(habit, this.history, this.todayDate);
  },

  getWeek(): WeekDay7[] {
    return getWeekProgress(this.habits, this.weekScores, this.todayCompleted, this.todayDate);
  },
});
