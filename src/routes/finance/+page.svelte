<script lang="ts">
  import { onMount } from 'svelte';
  import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Plus, X, Trash2, AlertTriangle, RotateCcw, DollarSign } from 'lucide-svelte';
  import Card from '$lib/components/Card.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import { haptic, HAPTIC_PATTERNS } from '$lib/haptics';
  import {
    financeStore,
    monthLabel,
    shiftMonth,
    calcTotals,
    calcBudgetSpent,
    budgetColor,
    budgetPct,
    type Transaction,
    type BudgetCategoryName,
  } from '$lib/finance.svelte';

  // ── Derived month data ──────────────────────────────────────
  let month = $derived(financeStore.currentMonth);
  let label = $derived(monthLabel(financeStore.currentKey));

  let totals = $derived(calcTotals(month));

  // Previous month stats for % change
  let prevKey = $derived(shiftMonth(financeStore.currentKey, -1));
  let prevMonth = $derived(financeStore.months[prevKey]);
  let prevTotals = $derived(prevMonth ? calcTotals(prevMonth) : null);

  let changePercent = $derived.by(() => {
    if (!prevTotals || prevTotals.totalAssets === 0) return null;
    return Math.round(((totals.totalAssets - prevTotals.totalAssets) / Math.abs(prevTotals.totalAssets)) * 1000) / 10;
  });

  // Sorted transactions newest first
  let sortedTx = $derived([...month.transactions].sort((a, b) => b.date.localeCompare(a.date)));

  // ── Budget editing ─────────────────────────────────────────
  let editingBudget = $state<BudgetCategoryName | null>(null);
  let editingBudgetValue = $state(0);

  function startEditBudget(name: BudgetCategoryName, currentLimit: number) {
    editingBudget = name;
    editingBudgetValue = currentLimit;
    haptic(HAPTIC_PATTERNS.light);
  }

  function saveBudget() {
    if (editingBudget) {
      financeStore.updateBudgetLimit(editingBudget, editingBudgetValue);
      editingBudget = null;
      haptic(HAPTIC_PATTERNS.snap);
    }
  }

  // ── Transaction modal ───────────────────────────────────────
  let showModal = $state(false);
  let txType = $state<'income' | 'expense'>('expense');
  let txTitle = $state('');
  let txAmount = $state('');
  let txCategory = $state<BudgetCategoryName | 'none'>('none');
  let txDate = $state(new Date().toISOString().split('T')[0]);
  let txRecurring = $state(false);
  let txRecurringDay = $state(1);

  function openModal() {
    showModal = true;
    txType = 'expense';
    txTitle = '';
    txAmount = '';
    txCategory = 'none';
    txDate = new Date().toISOString().split('T')[0];
    txRecurring = false;
    txRecurringDay = 1;
    haptic(HAPTIC_PATTERNS.medium);
  }

  function closeModal() {
    showModal = false;
    haptic(HAPTIC_PATTERNS.light);
  }

  function submitTransaction() {
    const amount = parseFloat(txAmount);
    if (!txTitle.trim() || isNaN(amount) || amount <= 0) return;

    financeStore.addTransaction({
      type: txType,
      title: txTitle.trim(),
      amount: Math.round(amount * 100) / 100,
      category: txCategory,
      date: txDate,
      recurring: txRecurring,
      recurringDay: txRecurringDay,
    });

    haptic(HAPTIC_PATTERNS.snap);
    closeModal();
  }

  // ── Delete transaction ──────────────────────────────────────
  let confirmDeleteId = $state<string | null>(null);

  function deleteTransaction(id: string) {
    financeStore.deleteTransaction(id);
    confirmDeleteId = null;
    haptic(HAPTIC_PATTERNS.heavy);
  }

  // ── FAB listener ───────────────────────────────────────────
  onMount(() => {
    const handler = (e: any) => {
      if (e.detail.type === 'finance') openModal();
    };
    document.addEventListener('fab-action', handler);
    return () => document.removeEventListener('fab-action', handler);
  });

  // ── Helpers ─────────────────────────────────────────────────
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const fmtDate = (iso: string) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
</script>

<div class="space-y-5 pb-6">

  <!-- ── Header with month nav ─────────────────────────────── -->
  <header class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-green-400">Finance</h1>
      <p class="text-zinc-500 font-medium text-sm">Asset & Expense Tracking</p>
    </div>
    <!-- Month navigator -->
    <div class="flex items-center gap-1 bg-zinc-900/60 rounded-2xl border border-zinc-800/50 px-2 py-1">
      <button
        onclick={() => { financeStore.navigatePrev(); haptic(HAPTIC_PATTERNS.light); }}
        class="p-1 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400"
        aria-label="Previous month">
        <ChevronLeft size={18} />
      </button>
      <span class="text-xs font-semibold text-zinc-200 px-1 min-w-24 text-center">{label}</span>
      <button
        onclick={() => { financeStore.navigateNext(); haptic(HAPTIC_PATTERNS.light); }}
        class="p-1 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400"
        aria-label="Next month">
        <ChevronRight size={18} />
      </button>
    </div>
  </header>

  <!-- ── Total Assets ─────────────────────────────────────── -->
  <section>
    <Card glowColor="green" class="flex flex-col items-center py-6 bg-gradient-to-b from-green-500/10 to-transparent">
      {#if month.rolloverFromPrev > 0}
        <span class="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mb-0.5">
          Rollover: {fmt(month.rolloverFromPrev)}
        </span>
      {/if}
      <span class="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Total Assets</span>
      <div class="text-4xl font-mono font-bold text-zinc-100">{fmt(totals.totalAssets)}</div>
      <div class="flex items-center gap-1 mt-2 {changePercent !== null && changePercent >= 0 ? 'text-green-400' : 'text-rose-400'}">
        {#if changePercent !== null}
          {#if changePercent >= 0}
            <TrendingUp size={14} />
            <span class="text-xs font-bold">+{changePercent}% vs last month</span>
          {:else}
            <TrendingDown size={14} />
            <span class="text-xs font-bold">{changePercent}% vs last month</span>
          {/if}
        {:else}
          <span class="text-xs text-zinc-600">No previous data</span>
        {/if}
      </div>
    </Card>
  </section>

  <!-- ── Income / Expense split ────────────────────────────── -->
  <section class="grid grid-cols-2 gap-4">
    <Card class="flex flex-col gap-1 border-l-2 border-l-green-500">
      <div class="flex items-center gap-2 text-green-400">
        <ArrowUpRight size={16} />
        <span class="text-[10px] uppercase font-bold">Income</span>
      </div>
      <p class="text-lg font-mono font-bold">{fmt(totals.income)}</p>
    </Card>
    <Card class="flex flex-col gap-1 border-l-2 border-l-rose-500">
      <div class="flex items-center gap-2 text-rose-400">
        <ArrowDownLeft size={16} />
        <span class="text-[10px] uppercase font-bold">Expenses</span>
      </div>
      <p class="text-lg font-mono font-bold">{fmt(totals.expenses)}</p>
    </Card>
  </section>

  <!-- ── Monthly Budgets ───────────────────────────────────── -->
  <section class="space-y-3">
    <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase">Monthly Budgets</h3>
    <Card class="space-y-5">
      {#each month.budgets as budget}
        {@const spent = calcBudgetSpent(month, budget.name)}
        {@const pct = budgetPct(spent, budget.limit)}
        {@const bColor = budgetColor(spent, budget.limit)}
        <div>
          <div class="flex justify-between items-center mb-2 gap-2">
            <span class="text-sm font-medium flex-1">{budget.name}</span>
            <div class="flex items-center gap-1.5">
              {#if bColor === 'red'}
                <AlertTriangle size={13} class="text-red-400 shrink-0" />
              {/if}
              <!-- Spent -->
              <span class="text-xs font-mono {bColor === 'red' ? 'text-red-400' : bColor === 'orange' ? 'text-orange-400' : 'text-zinc-400'}">
                {fmt(spent)}
              </span>
              <span class="text-zinc-600 text-xs">/</span>
              <!-- Clickable limit -->
              {#if editingBudget === budget.name}
                <!-- svelte-ignore a11y_autofocus -->
                <input
                  type="number"
                  autofocus
                  bind:value={editingBudgetValue}
                  onblur={saveBudget}
                  onkeydown={(e) => e.key === 'Enter' && saveBudget()}
                  class="w-20 bg-zinc-800 border border-green-500/50 rounded px-1.5 py-0.5 text-xs font-mono text-zinc-100 focus:outline-none"
                />
              {:else}
                <button
                  onclick={() => startEditBudget(budget.name, budget.limit)}
                  class="text-xs font-mono text-zinc-400 hover:text-green-400 transition-colors underline decoration-dashed underline-offset-2">
                  {fmt(budget.limit)}
                </button>
              {/if}
            </div>
          </div>
          <ProgressBar progress={pct} color="auto" height="h-2" />
        </div>
      {/each}
    </Card>
  </section>

  <!-- ── Recent Activity ───────────────────────────────────── -->
  <section class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase">Recent Activity</h3>
      <button
        onclick={openModal}
        class="flex items-center gap-1 text-green-400 hover:text-green-300 text-xs font-bold transition-colors">
        <Plus size={14} />
        Add
      </button>
    </div>

    <div class="space-y-2">
      {#if sortedTx.length === 0}
        <div class="text-center py-10 text-zinc-600 italic text-sm">
          No transactions yet. Hit + to add one.
        </div>
      {/if}

      {#each sortedTx as tx (tx.id)}
        <div class="flex items-center justify-between p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/50 group relative animate-zoom-fade-in">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div class="w-9 h-9 rounded-xl {tx.type === 'income' ? 'bg-green-500/15 border border-green-500/30' : 'bg-rose-500/15 border border-rose-500/30'} flex items-center justify-center shrink-0">
              <DollarSign size={15} class="{tx.type === 'income' ? 'text-green-400' : 'text-rose-400'}" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <p class="text-sm font-medium truncate">{tx.title}</p>
                {#if tx.recurring}
                  <span class="text-[9px] font-bold text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                    <RotateCcw size={8} />
                    Recurring
                  </span>
                {/if}
              </div>
              <div class="flex items-center gap-2 mt-0.5">
                <p class="text-[10px] text-zinc-500 uppercase">{fmtDate(tx.date)}</p>
                {#if tx.category !== 'none'}
                  <span class="text-[9px] font-medium text-zinc-500 bg-zinc-800/80 px-1.5 rounded">{tx.category}</span>
                {/if}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <span class="text-sm font-mono font-bold {tx.type === 'income' ? 'text-green-400' : 'text-rose-400'}">
              {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
            </span>
            <!-- Delete -->
            {#if confirmDeleteId === tx.id}
              <div class="flex items-center gap-1">
                <button onclick={() => deleteTransaction(tx.id)} class="text-[10px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 px-2 py-1 rounded-lg">Delete</button>
                <button onclick={() => confirmDeleteId = null} class="text-[10px] text-zinc-500 hover:text-zinc-300 px-1 py-1 rounded-lg">✕</button>
              </div>
            {:else}
              <button
                onclick={() => { confirmDeleteId = tx.id; haptic(HAPTIC_PATTERNS.light); }}
                class="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-700 hover:text-rose-400 p-1 rounded-lg">
                <Trash2 size={14} />
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </section>
</div>

<!-- ── Add Transaction Modal ─────────────────────────────────── -->
{#if showModal}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-50 flex items-end justify-center p-0" onclick={closeModal}>
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
    <!-- Sheet from bottom -->
    <div
      class="relative glass rounded-t-3xl p-6 w-full max-w-md border border-zinc-700/50 border-b-0 animate-slide-up"
      onclick={(e) => e.stopPropagation()}>

      <div class="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-5"></div>

      <div class="flex items-center justify-between mb-5">
        <h3 class="text-lg font-bold">New Transaction</h3>
        <button onclick={closeModal} class="text-zinc-500 hover:text-zinc-300 transition-colors">
          <X size={20} />
        </button>
      </div>

      <!-- Type Toggle -->
      <div class="flex bg-zinc-900 rounded-2xl p-1 mb-5">
        <button
          onclick={() => txType = 'expense'}
          class="flex-1 py-2.5 text-sm font-bold rounded-xl transition-all {txType === 'expense' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-zinc-500 hover:text-zinc-300'}">
          Expense −
        </button>
        <button
          onclick={() => txType = 'income'}
          class="flex-1 py-2.5 text-sm font-bold rounded-xl transition-all {txType === 'income' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-zinc-500 hover:text-zinc-300'}">
          Income +
        </button>
      </div>

      <div class="space-y-4">
        <!-- Title -->
        <div>
          <label class="text-[10px] text-zinc-500 uppercase font-bold block mb-1.5">Title</label>
          <input
            bind:value={txTitle}
            placeholder="e.g. Salary, Netflix, Groceries..."
            class="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-green-500/50 focus:outline-none transition-colors text-sm" />
        </div>

        <!-- Amount + Date row -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] text-zinc-500 uppercase font-bold block mb-1.5">Amount (USD)</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">$</span>
              <input
                type="number"
                bind:value={txAmount}
                min="0"
                step="0.01"
                placeholder="0.00"
                class="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-7 pr-3 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-green-500/50 focus:outline-none transition-colors text-sm" />
            </div>
          </div>
          <div>
            <label class="text-[10px] text-zinc-500 uppercase font-bold block mb-1.5">Date</label>
            <input
              type="date"
              bind:value={txDate}
              class="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-3 text-zinc-100 focus:border-green-500/50 focus:outline-none transition-colors text-sm" />
          </div>
        </div>

        <!-- Category (expense only) -->
        {#if txType === 'expense'}
          <div>
            <label class="text-[10px] text-zinc-500 uppercase font-bold block mb-1.5">Budget Category</label>
            <select
              bind:value={txCategory}
              class="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:border-green-500/50 focus:outline-none transition-colors text-sm">
              <option value="none">No Category</option>
              {#each month.budgets as b}
                <option value={b.name}>{b.name}</option>
              {/each}
            </select>
          </div>
        {/if}

        <!-- Recurring -->
        <div class="flex items-center justify-between bg-zinc-900 rounded-xl px-4 py-3 border border-zinc-800">
          <div>
            <p class="text-sm font-medium">Recurring</p>
            <p class="text-[10px] text-zinc-500">Auto-books each month</p>
          </div>
          <div class="flex items-center gap-3">
            {#if txRecurring}
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-zinc-500">Day</span>
                <input
                  type="number"
                  bind:value={txRecurringDay}
                  min="1"
                  max="31"
                  class="w-14 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-100 text-xs text-center focus:outline-none" />
              </div>
            {/if}
            <button
              onclick={() => { txRecurring = !txRecurring; haptic(HAPTIC_PATTERNS.light); }}
              class="w-10 h-6 rounded-full transition-all {txRecurring ? 'bg-green-500' : 'bg-zinc-700'} relative">
              <span class="absolute top-0.5 {txRecurring ? 'left-[calc(100%-22px)]' : 'left-0.5'} w-5 h-5 rounded-full bg-white shadow transition-all"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <button
        onclick={submitTransaction}
        class="w-full mt-5 {txType === 'income' ? 'bg-green-500 hover:bg-green-400 shadow-[0_4px_20px_rgba(34,197,94,0.3)]' : 'bg-rose-500 hover:bg-rose-400 shadow-[0_4px_20px_rgba(244,63,94,0.3)]'} text-white font-bold py-4 rounded-2xl transition-all active:scale-95">
        {txType === 'income' ? '+ Add Income' : '− Add Expense'}
      </button>
    </div>
  </div>
{/if}

<style>
  @keyframes slide-up {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .animate-slide-up {
    animation: slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards;
  }
</style>
