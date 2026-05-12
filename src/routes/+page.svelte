<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import { globalState } from '$lib/state.svelte';
  import { Heart, Zap, Wallet, ListChecks, Sun, Cloud, Wind } from 'lucide-svelte';
</script>

<div class="space-y-6 pb-6">
  <header class="flex items-center justify-between">
    <div class="space-y-1">
      <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p class="text-zinc-500 font-medium text-sm">Welcome back, Commander.</p>
    </div>
    <div class="bg-zinc-900/60 p-2 rounded-2xl border border-zinc-800/50 flex items-center gap-3">
      <div class="text-right">
        <p class="text-[10px] text-zinc-500 uppercase font-bold leading-none">Vitality</p>
        <p class="text-lg font-mono font-bold text-teal-400 leading-none mt-1">{globalState.stats.vitality}%</p>
      </div>
      <div class="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
        <Zap size={20} class="text-teal-400" />
      </div>
    </div>
  </header>

  <!-- Weather & Quick Info -->
  <section class="grid grid-cols-2 gap-4">
    <Card class="flex flex-col gap-2 relative overflow-hidden">
      <div class="flex items-center justify-between">
        <Sun size={20} class="text-yellow-400" />
        <span class="text-xs font-mono text-zinc-400">{globalState.weather.temperature}°C</span>
      </div>
      <div>
        <p class="text-[10px] text-zinc-500 uppercase font-bold">Vienna, AT</p>
        <p class="text-sm font-medium">{globalState.weather.condition}</p>
      </div>
      <div class="flex items-center gap-3 mt-2">
        <div class="flex items-center gap-1">
          <Wind size={12} class="text-zinc-500" />
          <span class="text-[10px] text-zinc-400">AQI: {globalState.weather.aqi}</span>
        </div>
      </div>
    </Card>
    
    <Card class="flex flex-col gap-2 border-t-orange-500/20">
      <div class="flex items-center gap-2 text-orange-400">
        <Flame size={18} />
        <span class="text-xs font-bold uppercase tracking-wider">Streak</span>
      </div>
      <div class="mt-auto">
        <p class="text-3xl font-mono font-bold text-zinc-100">{globalState.streak}</p>
        <p class="text-[10px] text-zinc-500 uppercase font-medium">Days active</p>
      </div>
    </Card>
  </section>

  <!-- Systems Status -->
  <section class="space-y-3">
    <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase">Systems Status</h3>
    <div class="grid grid-cols-2 gap-3">
      <Card class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <Heart size={16} class="text-rose-400" />
          <span class="text-[10px] font-mono text-rose-400">{globalState.stats.health}%</span>
        </div>
        <ProgressBar progress={globalState.stats.health} color="rose" height="h-1" />
        <span class="text-[10px] text-zinc-500 font-medium">Health</span>
      </Card>
      
      <Card class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <Zap size={16} class="text-teal-400" />
          <span class="text-[10px] font-mono text-teal-400">{globalState.stats.productivity}%</span>
        </div>
        <ProgressBar progress={globalState.stats.productivity} color="teal" height="h-1" />
        <span class="text-[10px] text-zinc-500 font-medium">Focus</span>
      </Card>
      
      <Card class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <Wallet size={16} class="text-green-400" />
          <span class="text-[10px] font-mono text-green-400">{globalState.stats.finance}%</span>
        </div>
        <ProgressBar progress={globalState.stats.finance} color="green" height="h-1" />
        <span class="text-[10px] text-zinc-500 font-medium">Finance</span>
      </Card>
      
      <Card class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <ListChecks size={16} class="text-yellow-400" />
          <span class="text-[10px] font-mono text-yellow-400">{globalState.stats.habits}%</span>
        </div>
        <ProgressBar progress={globalState.stats.habits} color="yellow" height="h-1" />
        <span class="text-[10px] text-zinc-500 font-medium">Habits</span>
      </Card>
    </div>
  </section>

  <!-- Active Protocols -->
  <section class="space-y-3">
    <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase">Active Protocols</h3>
    {#each globalState.activeProtocols as protocol}
      <Card class="flex items-center justify-between !p-4 border-l-2 {protocol.color === 'teal' ? 'border-l-teal-500' : 'border-l-green-500'}">
        <div>
          <h4 class="text-sm font-medium">{protocol.title}</h4>
          <p class="text-[10px] text-zinc-500 uppercase mt-0.5">{protocol.type}</p>
        </div>
        <div class="text-right">
          <p class="font-mono text-sm font-bold text-zinc-100">{protocol.value}</p>
        </div>
      </Card>
    {/each}
  </section>
</div>

<style>
  :global(.text-rose-400) { color: #fb7185; }
  :global(.bg-rose-500) { background-color: #f43f5e; }
</style>
