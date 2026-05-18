// ============================================================
// finance.svelte.ts – LifeOS Finance Engine
// ============================================================

const FINANCE_STORAGE_KEY = 'lifeos_finance';

// ── Types ────────────────────────────────────────────────────

export type BudgetCategoryName = 'Survival' | 'Investment Fund' | 'Leisure & Tech';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  title: string;
  amount: number;           // always positive
  category: BudgetCategoryName | 'none';
  date: string;             // YYYY-MM-DD
  recurring: boolean;
  recurringDay: number;     // 1-31, day of month to re-book
}

export interface BudgetTarget {
  name: BudgetCategoryName;
  limit: number;
}

export interface MonthData {
  transactions: Transaction[];
  budgets: BudgetTarget[];
  rolloverFromPrev: number;   // surplus carried from previous month
}

export interface FinanceStore {
  months: Record<string, MonthData>;   // key: 'YYYY-MM'
}

// ── Helpers ──────────────────────────────────────────────────

/** Zero-padded month key from a Date */
export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Add N months to a 'YYYY-MM' key, returns new key */
export function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return monthKey(d);
}

/** Human-readable label: 'May 2026' */
export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const DEFAULT_BUDGETS: BudgetTarget[] = [
  { name: 'Survival', limit: 900 },
  { name: 'Investment Fund', limit: 500 },
  { name: 'Leisure & Tech', limit: 300 },
];

/** Default seed transactions for the initial month so the UI isn't empty */
function seedTransactions(key: string): Transaction[] {
  const [y, m] = key.split('-').map(Number);
  const fmt = (d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  return [
    {
      id: 'seed-1',
      type: 'income',
      title: 'Salary Deposit',
      amount: 3200,
      category: 'none',
      date: fmt(1),
      recurring: true,
      recurringDay: 1,
    },
    {
      id: 'seed-2',
      type: 'expense',
      title: 'Cloud Subscription',
      amount: 12.99,
      category: 'Leisure & Tech',
      date: fmt(5),
      recurring: true,
      recurringDay: 5,
    },
    {
      id: 'seed-3',
      type: 'expense',
      title: 'Rent',
      amount: 750,
      category: 'Survival',
      date: fmt(1),
      recurring: true,
      recurringDay: 1,
    },
    {
      id: 'seed-4',
      type: 'expense',
      title: 'Groceries',
      amount: 100,
      category: 'Survival',
      date: fmt(7),
      recurring: false,
      recurringDay: 7,
    },
    {
      id: 'seed-5',
      type: 'expense',
      title: 'Investment Transfer',
      amount: 500,
      category: 'Investment Fund',
      date: fmt(2),
      recurring: true,
      recurringDay: 2,
    },
  ];
}

// ── Calculation helpers ───────────────────────────────────────

export function calcTotals(month: MonthData) {
  const income = month.transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const expenses = month.transactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  const surplus = income - expenses;
  const totalAssets = Math.round((month.rolloverFromPrev + income - expenses) * 100) / 100;
  return { income, expenses, surplus, totalAssets };
}

export function calcBudgetSpent(month: MonthData, categoryName: BudgetCategoryName): number {
  return Math.round(
    month.transactions
      .filter(t => t.type === 'expense' && t.category === categoryName)
      .reduce((s, t) => s + t.amount, 0) * 100
  ) / 100;
}

// ── Budget color logic ────────────────────────────────────────

export function budgetColor(spent: number, limit: number): 'green' | 'orange' | 'red' {
  if (limit === 0) return 'red';
  const pct = spent / limit;
  if (pct >= 1) return 'red';
  if (pct >= 0.75) return 'orange';
  return 'green';
}

export function budgetPct(spent: number, limit: number): number {
  if (limit === 0) return 100;
  return Math.min(100, Math.round((spent / limit) * 100));
}

// ── Persist / Load ───────────────────────────────────────────

function persist(data: FinanceStore) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(data));
  }
}

function load(): FinanceStore {
  if (typeof window === 'undefined') return { months: {} };
  try {
    const raw = localStorage.getItem(FINANCE_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as FinanceStore;
  } catch {
    // corrupted storage – start fresh
  }
  return { months: {} };
}

// ── Recurring transaction processor ──────────────────────────

function processRecurring(store: FinanceStore, targetKey: string) {
  const prevKey = shiftMonth(targetKey, -1);
  const prevMonth = store.months[prevKey];
  if (!prevMonth) return;

  const recurringTemplates = prevMonth.transactions.filter(t => t.recurring);
  if (recurringTemplates.length === 0) return;

  const target = store.months[targetKey];
  const [y, m] = targetKey.split('-').map(Number);

  for (const tmpl of recurringTemplates) {
    // Don't duplicate if already booked (same title + type)
    const alreadyBooked = target.transactions.some(
      t => t.title === tmpl.title && t.type === tmpl.type && t.recurring
    );
    if (alreadyBooked) continue;

    const day = Math.min(tmpl.recurringDay, new Date(y, m, 0).getDate()); // clamp to month length
    const date = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    target.transactions.push({
      ...tmpl,
      id: `rec-${Date.now()}-${Math.random()}`,
      date,
    });
  }

  // Sort newest first
  target.transactions.sort((a, b) => b.date.localeCompare(a.date));
}

// ── Rollover injection ────────────────────────────────────────

function injectRollover(store: FinanceStore, targetKey: string) {
  const prevKey = shiftMonth(targetKey, -1);
  const prevMonth = store.months[prevKey];
  if (!prevMonth) return;

  const { income, expenses } = calcTotals(prevMonth);
  const prevSurplus = prevMonth.rolloverFromPrev + income - expenses;
  store.months[targetKey].rolloverFromPrev = Math.round(prevSurplus * 100) / 100;
}

// ── Get or create a month ────────────────────────────────────

function getOrCreateMonth(store: FinanceStore, key: string): MonthData {
  if (!store.months[key]) {
    const isCurrentOrEarliest = Object.keys(store.months).length === 0;
    store.months[key] = {
      transactions: isCurrentOrEarliest ? seedTransactions(key) : [],
      budgets: DEFAULT_BUDGETS.map(b => ({ ...b })),
      rolloverFromPrev: 0,
    };

    if (!isCurrentOrEarliest) {
      injectRollover(store, key);
      processRecurring(store, key);
    }
  }
  return store.months[key];
}

// ── Reactive Store ────────────────────────────────────────────

const _loaded = load();
const _currentKey = monthKey(new Date());

// Ensure current month exists
if (!_loaded.months[_currentKey]) {
  const isFirst = Object.keys(_loaded.months).length === 0;
  _loaded.months[_currentKey] = {
    transactions: isFirst ? seedTransactions(_currentKey) : [],
    budgets: DEFAULT_BUDGETS.map(b => ({ ...b })),
    rolloverFromPrev: 0,
  };
  if (!isFirst) {
    injectRollover(_loaded, _currentKey);
    processRecurring(_loaded, _currentKey);
  }
}

export const financeStore = $state({
  months: _loaded.months as Record<string, MonthData>,
  currentKey: _currentKey,

  // ── Navigation ──────────────────────────────────────────
  get currentMonth(): MonthData {
    return getOrCreateMonth(this, this.currentKey);
  },

  navigatePrev() {
    this.currentKey = shiftMonth(this.currentKey, -1);
    getOrCreateMonth(this, this.currentKey);
    persist({ months: this.months });
  },

  navigateNext() {
    this.currentKey = shiftMonth(this.currentKey, 1);
    getOrCreateMonth(this, this.currentKey);
    persist({ months: this.months });
  },

  // ── Transactions ────────────────────────────────────────
  addTransaction(tx: Omit<Transaction, 'id'>) {
    const month = getOrCreateMonth(this, this.currentKey);
    const newTx: Transaction = { ...tx, id: `tx-${Date.now()}-${Math.random()}` };
    month.transactions = [newTx, ...month.transactions].sort(
      (a, b) => b.date.localeCompare(a.date)
    );
    persist({ months: this.months });
  },

  deleteTransaction(id: string) {
    const month = this.currentMonth;
    month.transactions = month.transactions.filter(t => t.id !== id);
    persist({ months: this.months });
  },

  // ── Budgets ─────────────────────────────────────────────
  updateBudgetLimit(name: BudgetCategoryName, limit: number) {
    const month = this.currentMonth;
    const budget = month.budgets.find(b => b.name === name);
    if (budget) {
      budget.limit = Math.max(0, limit);
      persist({ months: this.months });
    }
  },
});
