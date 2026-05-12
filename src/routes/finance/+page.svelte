<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import { Wallet, TrendingUp, TrendingDown, DollarSign, PieChart, ArrowUpRight, ArrowDownLeft } from 'lucide-svelte';
</script>

<div class="space-y-6 pb-6">
  <header class="space-y-1">
    <h1 class="text-3xl font-bold tracking-tight text-green-400">Finance</h1>
    <p class="text-zinc-500 font-medium text-sm">Asset & Expense Tracking</p>
  </header>

  <!-- Total Balance -->
  <section>
    <Card glowColor="green" class="flex flex-col items-center py-6 bg-gradient-to-b from-green-500/10 to-transparent">
      <span class="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Total Assets</span>
      <div class="text-4xl font-mono font-bold text-zinc-100">$42,850.00</div>
      <div class="flex items-center gap-1 text-green-400 mt-2">
        <TrendingUp size={14} />
        <span class="text-xs font-bold">+2.4% this month</span>
      </div>
    </Card>
  </section>

  <!-- Cashflow -->
  <section class="grid grid-cols-2 gap-4">
    <Card class="flex flex-col gap-1 border-l-2 border-l-green-500">
      <div class="flex items-center gap-2 text-green-400">
        <ArrowUpRight size={16} />
        <span class="text-[10px] uppercase font-bold">Income</span>
      </div>
      <p class="text-lg font-mono font-bold">$3,200</p>
    </Card>
    
    <Card class="flex flex-col gap-1 border-l-2 border-l-rose-500">
      <div class="flex items-center gap-2 text-rose-400">
        <ArrowDownLeft size={16} />
        <span class="text-[10px] uppercase font-bold">Expenses</span>
      </div>
      <p class="text-lg font-mono font-bold">$1,450</p>
    </Card>
  </section>

  <!-- Budget Targets -->
  <section class="space-y-3">
    <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase">Monthly Budgets</h3>
    <Card class="space-y-4">
      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm">Survival (Rent, Food)</span>
          <span class="text-xs font-mono text-zinc-400">$850 / $900</span>
        </div>
        <ProgressBar progress={94} color="green" />
      </div>
      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm">Investment Fund</span>
          <span class="text-xs font-mono text-zinc-400">$500 / $500</span>
        </div>
        <ProgressBar progress={100} color="teal" />
      </div>
      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm">Leisure & Tech</span>
          <span class="text-xs font-mono text-zinc-400">$100 / $300</span>
        </div>
        <ProgressBar progress={33} color="yellow" />
      </div>
    </Card>
  </section>

  <!-- Recent Transactions -->
  <section class="space-y-3">
    <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase">Recent Activity</h3>
    <div class="space-y-2">
      <div class="flex items-center justify-between p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/50">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
            <DollarSign size={16} class="text-green-400" />
          </div>
          <div>
            <p class="text-sm font-medium">Salary Deposit</p>
            <p class="text-[10px] text-zinc-500 uppercase">May 01</p>
          </div>
        </div>
        <span class="text-sm font-mono font-bold text-green-400">+$3,200.00</span>
      </div>
      
      <div class="flex items-center justify-between p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/50">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
            <DollarSign size={16} class="text-rose-400" />
          </div>
          <div>
            <p class="text-sm font-medium">Cloud Subscription</p>
            <p class="text-[10px] text-zinc-500 uppercase">May 05</p>
          </div>
        </div>
        <span class="text-sm font-mono font-bold text-rose-400">-$12.99</span>
      </div>
    </div>
  </section>
</div>
