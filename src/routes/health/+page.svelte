<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import { Moon, Activity, Droplets, Utensils, Pill } from 'lucide-svelte';

  const healthScore = 84;
</script>

<div class="space-y-6 pb-6">
  <header class="space-y-1">
    <h1 class="text-3xl font-bold tracking-tight">Health</h1>
    <p class="text-green-400 font-medium text-sm">Recovery is optimal. Ready to train.</p>
  </header>

  <!-- Health Score -->
  <section>
    <Card glowColor="green" class="flex items-center gap-6">
      <div class="relative w-24 h-24 flex items-center justify-center">
        <!-- SVG Circle representation -->
        <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path class="text-zinc-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3" />
          <path class="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" stroke-dasharray="{healthScore}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        </svg>
        <div class="absolute flex flex-col items-center">
          <span class="text-2xl font-mono font-bold text-zinc-100">{healthScore}</span>
        </div>
      </div>
      <div class="flex-1 space-y-2">
        <h2 class="font-semibold text-lg">Health Score</h2>
        <div class="space-y-1">
          <div class="flex justify-between text-xs">
            <span class="text-zinc-400">Sleep</span>
            <span class="font-mono text-green-400">92%</span>
          </div>
          <ProgressBar progress={92} color="green" height="h-1" />
        </div>
        <div class="space-y-1">
          <div class="flex justify-between text-xs mt-1">
            <span class="text-zinc-400">Activity</span>
            <span class="font-mono text-teal-400">76%</span>
          </div>
          <ProgressBar progress={76} color="teal" height="h-1" />
        </div>
      </div>
    </Card>
  </section>

  <!-- Sleep Data -->
  <section class="grid grid-cols-2 gap-4">
    <Card class="space-y-3">
      <div class="flex items-center gap-2 text-indigo-400">
        <Moon size={18} />
        <span class="font-medium text-sm">Deep Sleep</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-2xl font-mono font-bold">1h 45m</span>
      </div>
      <ProgressBar progress={80} color="teal" height="h-1.5" />
    </Card>
    <Card class="space-y-3">
      <div class="flex items-center gap-2 text-orange-400">
        <Activity size={18} />
        <span class="font-medium text-sm">Steps</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-2xl font-mono font-bold">8,432</span>
      </div>
      <ProgressBar progress={65} color="yellow" height="h-1.5" />
    </Card>
  </section>

  <!-- Check-ins -->
  <section>
    <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase mb-3">Daily Check-ins</h3>
    <div class="grid grid-cols-2 gap-3">
      <button class="bg-zinc-800/60 border border-zinc-700/50 hover:bg-zinc-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors">
        <Droplets size={24} class="text-blue-400" />
        <span class="text-sm font-medium text-zinc-300">Water: 1.5L</span>
      </button>
      <button class="bg-zinc-800/60 border border-zinc-700/50 hover:bg-zinc-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors">
        <Utensils size={24} class="text-green-400" />
        <span class="text-sm font-medium text-zinc-300">Nutrition</span>
      </button>
    </div>
  </section>

  <!-- Supplement Stack -->
  <section>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase">Supplement Stack</h3>
    </div>
    <Card class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-zinc-800 rounded-lg">
            <Pill size={16} class="text-yellow-400" />
          </div>
          <div>
            <h4 class="text-sm font-medium">Vitamin D3 + K2</h4>
            <p class="text-[10px] text-zinc-500 font-mono mt-0.5">Morning • 5000 IU</p>
          </div>
        </div>
        <button class="w-6 h-6 rounded border border-green-500/50 bg-green-500/10 text-green-400 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </button>
      </div>
      <div class="flex items-center justify-between opacity-60">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-zinc-800 rounded-lg">
            <Pill size={16} class="text-indigo-400" />
          </div>
          <div>
            <h4 class="text-sm font-medium">Magnesium Glycinate</h4>
            <p class="text-[10px] text-zinc-500 font-mono mt-0.5">Evening • 400mg</p>
          </div>
        </div>
        <button class="w-6 h-6 rounded border border-zinc-700 bg-zinc-800 flex items-center justify-center"></button>
      </div>
    </Card>
  </section>
</div>
