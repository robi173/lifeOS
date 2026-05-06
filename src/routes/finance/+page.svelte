<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import { Wallet, ArrowUpRight, ArrowDownRight, Coffee, Car, ShoppingBag, PiggyBank } from 'lucide-svelte';

  const balance = 12450.50;
  const spent = 430.20;
  const budget = 1200;
  
  const budgetPercent = Math.min((spent / budget) * 100, 100);

  const transactions = [
    { id: 1, title: 'Coffee Roasters', amount: -4.50, icon: Coffee, color: 'text-amber-500' },
    { id: 2, title: 'Uber', amount: -15.20, icon: Car, color: 'text-blue-500' },
    { id: 3, title: 'Grocery Store', amount: -65.30, icon: ShoppingBag, color: 'text-green-500' }
  ];
</script>

<div class="space-y-6 pb-6">
  <header class="space-y-1">
    <h1 class="text-3xl font-bold tracking-tight">Finance</h1>
    <p class="text-blue-400 font-medium text-sm">On track for monthly savings goal.</p>
  </header>

  <!-- Total Balance -->
  <section>
    <Card glowColor="teal" class="flex flex-col items-center justify-center py-8">
      <div class="p-3 bg-teal-500/10 rounded-full mb-3 text-teal-400">
        <Wallet size={28} />
      </div>
      <p class="text-zinc-400 text-sm font-medium mb-1">Total Balance</p>
      <div class="flex items-baseline gap-1">
        <span class="text-zinc-500 text-2xl font-bold">$</span>
        <span class="text-5xl font-mono font-bold tracking-tight neon-text-teal">{balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
      </div>
    </Card>
  </section>

  <!-- Budget Overview -->
  <section>
    <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase mb-3">Monthly Budget</h3>
    <Card class="space-y-4">
      <div class="flex justify-between items-end">
        <div>
          <span class="text-2xl font-mono font-bold text-zinc-100">${spent.toFixed(2)}</span>
          <span class="text-zinc-500 text-sm font-medium ml-1">spent</span>
        </div>
        <div class="text-right">
          <span class="text-sm font-mono text-zinc-400">of ${budget}</span>
        </div>
      </div>
      <ProgressBar progress={budgetPercent} color={budgetPercent > 90 ? 'yellow' : 'teal'} />
      <p class="text-xs text-zinc-400">You have ${(budget - spent).toFixed(2)} left for the next 14 days.</p>
    </Card>
  </section>

  <!-- Quick Stats -->
  <section class="grid grid-cols-2 gap-3">
    <Card class="p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
        <ArrowDownRight size={20} />
      </div>
      <div>
        <p class="text-xs text-zinc-500 font-medium uppercase">Income</p>
        <p class="font-mono font-bold text-zinc-100">$2,400</p>
      </div>
    </Card>
    <Card class="p-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
        <ArrowUpRight size={20} />
      </div>
      <div>
        <p class="text-xs text-zinc-500 font-medium uppercase">Expenses</p>
        <p class="font-mono font-bold text-zinc-100">${spent.toFixed(0)}</p>
      </div>
    </Card>
  </section>

  <!-- Recent Transactions -->
  <section>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase">Recent Activity</h3>
      <button class="text-xs text-teal-400 font-medium hover:underline">See All</button>
    </div>
    <div class="space-y-3">
      {#each transactions as tx}
        {@const Icon = tx.icon}
        <Card class="!p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center {tx.color}">
              <Icon size={20} />
            </div>
            <span class="font-medium text-sm text-zinc-100">{tx.title}</span>
          </div>
          <span class="font-mono font-medium text-sm {tx.amount > 0 ? 'text-green-400' : 'text-zinc-300'}">
            {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
          </span>
        </Card>
      {/each}
    </div>
  </section>

  <!-- Savings Goals -->
  <section>
    <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase mb-3">Savings Goals</h3>
    <Card class="flex items-center gap-4">
      <div class="p-3 bg-zinc-800 rounded-xl text-teal-400">
        <PiggyBank size={24} />
      </div>
      <div class="flex-1 space-y-2">
        <div class="flex justify-between items-center text-sm">
          <span class="font-medium text-zinc-100">Emergency Fund</span>
          <span class="font-mono text-xs text-teal-400">80%</span>
        </div>
        <ProgressBar progress={80} color="teal" />
      </div>
    </Card>
  </section>
</div>
