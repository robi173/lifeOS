<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import { Zap, HeartPulse, Wallet, ListChecks, Globe2, Activity } from 'lucide-svelte';
  import { globalState } from '$lib/state.svelte';
</script>

<div class="space-y-6 pb-6">
  <!-- Header & Motivational Message -->
  <header class="space-y-1">
    <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
    <p class="text-teal-400 font-medium text-sm">Consistency is driving your score up.</p>
  </header>

  <!-- Vitality Score -->
  <section>
    <Card glowColor="teal" class="flex items-center justify-between !py-6">
      <div class="space-y-2">
        <h2 class="text-zinc-400 font-medium text-sm flex items-center gap-2">
          <Activity size={16} /> Vitality Score
        </h2>
        <div class="flex items-baseline gap-1">
          <span class="text-5xl font-mono font-bold neon-text-teal">{globalState.stats.vitality}</span>
          <span class="text-zinc-500 font-medium">/ 100</span>
        </div>
      </div>
      <div class="w-20 h-20 rounded-full border-4 border-teal-500/20 border-t-teal-400 border-r-teal-400 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)]">
        <span class="text-xl font-bold">Optimal</span>
      </div>
    </Card>
  </section>

  <!-- Metrics Grid -->
  <section class="grid grid-cols-2 gap-4">
    <!-- Productivity -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div onclick={() => globalState.improveStat('productivity', 2)} class="active-sink cursor-pointer">
      <Card class="space-y-4 h-full">
        <div class="flex justify-between items-start">
          <div class="p-2 bg-zinc-800/50 rounded-lg">
            <Zap size={20} class="text-yellow-400" />
          </div>
          <span class="font-mono text-lg font-bold text-yellow-400">{globalState.stats.productivity}%</span>
        </div>
        <div>
          <p class="text-xs text-zinc-400 font-medium mb-2">Productivity</p>
          <ProgressBar progress={globalState.stats.productivity} color="yellow" height="h-1.5" />
        </div>
      </Card>
    </div>

    <!-- Health -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div onclick={() => globalState.improveStat('health', 2)} class="active-sink cursor-pointer">
      <Card class="space-y-4 h-full">
        <div class="flex justify-between items-start">
          <div class="p-2 bg-zinc-800/50 rounded-lg">
            <HeartPulse size={20} class="text-green-400" />
          </div>
          <span class="font-mono text-lg font-bold text-green-400">{globalState.stats.health}%</span>
        </div>
        <div>
          <p class="text-xs text-zinc-400 font-medium mb-2">Health</p>
          <ProgressBar progress={globalState.stats.health} color="green" height="h-1.5" />
        </div>
      </Card>
    </div>

    <!-- Finance -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div onclick={() => globalState.improveStat('finance', 2)} class="active-sink cursor-pointer">
      <Card class="space-y-4 h-full">
        <div class="flex justify-between items-start">
          <div class="p-2 bg-zinc-800/50 rounded-lg">
            <Wallet size={20} class="text-blue-400" />
          </div>
          <span class="font-mono text-lg font-bold text-blue-400">{globalState.stats.finance}%</span>
        </div>
        <div>
          <p class="text-xs text-zinc-400 font-medium mb-2">Finance</p>
          <ProgressBar progress={globalState.stats.finance} color="teal" height="h-1.5" />
        </div>
      </Card>
    </div>

    <!-- Habits -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div onclick={() => globalState.improveStat('habits', 2)} class="active-sink cursor-pointer">
      <Card class="space-y-4 h-full">
        <div class="flex justify-between items-start">
          <div class="p-2 bg-zinc-800/50 rounded-lg">
            <ListChecks size={20} class="text-purple-400" />
          </div>
          <span class="font-mono text-lg font-bold text-purple-400">{globalState.stats.habits}%</span>
        </div>
        <div>
          <p class="text-xs text-zinc-400 font-medium mb-2">Habits</p>
          <ProgressBar progress={globalState.stats.habits} color="teal" height="h-1.5" />
        </div>
      </Card>
    </div>
  </section>

  <!-- Active Protocols -->
  <section>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase">Active Protocols</h3>
      <button class="text-xs text-teal-400 font-medium hover:underline">View All</button>
    </div>
    <Card class="space-y-3">
      {#each globalState.activeProtocols as protocol}
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-2 h-2 rounded-full bg-{protocol.color}-400 shadow-[0_0_8px_rgba(var(--color-{protocol.color}-500),0.8)] animate-pulse"></div>
            <span class="font-medium text-sm">{protocol.title}</span>
          </div>
          <span class="text-xs font-mono text-zinc-400">{protocol.value}</span>
        </div>
      {/each}
    </Card>
  </section>

  <!-- World View -->
  <section>
    <Card class="flex items-center gap-4">
      <div class="p-3 bg-zinc-800/60 rounded-xl">
        <Globe2 size={24} class="text-zinc-300" />
      </div>
      <div>
        <h4 class="font-medium text-sm">{globalState.weather.location}</h4>
        <p class="text-xs text-zinc-400 mt-1">{globalState.weather.temperature}°C · {globalState.weather.condition} · AQI {globalState.weather.aqi}</p>
      </div>
    </Card>
  </section>
</div>
