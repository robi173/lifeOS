<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$lib/components/Card.svelte';
  import Skeleton from '$lib/components/Skeleton.svelte';
  import { globalState } from '$lib/state.svelte';
  import { authStore } from '$lib/auth.svelte';
  import { financeStore, calcTotals } from '$lib/finance.svelte';
  import { habitsStore } from '$lib/habits.svelte';
  import { Heart, Zap, Wallet, ListChecks, Target, Flame } from 'lucide-svelte';
  import { haptic, HAPTIC_PATTERNS } from '$lib/haptics';
  import { goto } from '$app/navigation';
  import { NAV_ITEMS } from '$lib/navigation';

  let isLoading = $state(true);

  onMount(() => {
    const timer = setTimeout(() => {
      isLoading = false;
    }, 400); // Simulate network load for skeletons
    return () => clearTimeout(timer);
  });

  // Derived dashboard data
  let nextTask = $derived(globalState.tasks.find((t: (typeof globalState.tasks)[number]) => !t.completed));
  let totalAssets = $derived(calcTotals(financeStore.currentMonth).totalAssets);

  const routeByKey = {
    focus: NAV_ITEMS.find((item) => item.key === 'focus')?.path ?? '/focus',
    health: NAV_ITEMS.find((item) => item.key === 'health')?.path ?? '/health',
    finance: NAV_ITEMS.find((item) => item.key === 'finance')?.path ?? '/finance',
    habits: NAV_ITEMS.find((item) => item.key === 'habits')?.path ?? '/habits'
  } as const;
  
  let topHabit = $derived(() => {
    let best = null;
    let maxStreak = -1;
    for (const h of habitsStore.habits) {
      const s = habitsStore.getStreak(h.id);
      if (s > maxStreak) {
        maxStreak = s;
        best = { ...h, streak: s };
      }
    }
    return best;
  });
</script>

<div class="space-y-6 pb-6">
  <!-- Header -->
  <header class="space-y-1">
    <h1 class="text-3xl font-bold tracking-tight">Command Center</h1>
    {#if isLoading}
      <Skeleton width="w-48" height="h-5" rounded="rounded-md" />
    {:else}
      <p class="text-zinc-500 font-medium text-sm">Guten Tag, {authStore.user?.name || 'Commander'}.</p>
    {/if}
  </header>

  <!-- Widgets Grid -->
  <div class="grid grid-cols-1 gap-4">
    
    <!-- Focus Widget -->
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <Card class="relative overflow-hidden cursor-pointer hover:border-teal-500/30 transition-colors active:scale-[0.98]" onclick={() => { haptic(HAPTIC_PATTERNS.light); goto(routeByKey.focus); }}>
      <div class="absolute right-0 top-0 w-24 h-24 bg-teal-500/10 rounded-bl-full blur-2xl pointer-events-none"></div>
      
      <div class="flex items-center gap-2 text-teal-400 mb-3 relative z-10">
        <Target size={18} />
        <span class="text-xs font-bold uppercase tracking-wider">Next Focus</span>
      </div>
      
      <div class="relative z-10">
        {#if isLoading}
          <div class="space-y-2">
            <Skeleton height="h-6" />
            <Skeleton width="w-2/3" height="h-4" />
          </div>
        {:else if nextTask}
          <h3 class="text-lg font-bold text-zinc-100">{nextTask.title}</h3>
          <p class="text-xs text-zinc-500 font-medium uppercase mt-1">Due at {nextTask.time} &bull; Priority: {nextTask.priority}</p>
        {:else}
          <p class="text-zinc-500 italic text-sm">All tasks completed.</p>
        {/if}
      </div>
    </Card>

    <div class="grid grid-cols-2 gap-4">
      <!-- Finance Widget -->
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <Card class="cursor-pointer hover:border-green-500/30 transition-colors active:scale-[0.98]" onclick={() => { haptic(HAPTIC_PATTERNS.light); goto(routeByKey.finance); }}>
        <div class="flex items-center gap-2 text-green-400 mb-2">
          <Wallet size={16} />
          <span class="text-[10px] font-bold uppercase tracking-wider">Assets</span>
        </div>
        {#if isLoading}
          <Skeleton height="h-8" rounded="rounded-xl" />
        {:else}
          <p class="text-2xl font-mono font-bold text-zinc-100">&euro;{totalAssets.toLocaleString()}</p>
        {/if}
      </Card>

      <!-- Habit Widget -->
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <Card class="cursor-pointer hover:border-yellow-500/30 transition-colors active:scale-[0.98]" onclick={() => { haptic(HAPTIC_PATTERNS.light); goto(routeByKey.habits); }}>
        <div class="flex items-center gap-2 text-yellow-400 mb-2">
          <Flame size={16} />
          <span class="text-[10px] font-bold uppercase tracking-wider">Top Habit</span>
        </div>
        {#if isLoading}
          <div class="space-y-1">
            <Skeleton height="h-4" />
            <Skeleton height="h-3" width="w-1/2" />
          </div>
        {:else if topHabit()}
          {@const th = topHabit()!}
          <p class="text-sm font-bold text-zinc-100 truncate">{th.title}</p>
          <p class="text-[10px] text-orange-400 font-bold uppercase mt-1">{th.streak} Day Streak</p>
        {:else}
          <p class="text-xs text-zinc-500 italic">No active habits</p>
        {/if}
      </Card>
    </div>
  </div>

  <!-- Systems Overview -->
  <section class="space-y-3 mt-4">
    <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase">Systems Overview</h3>
    <div class="grid grid-cols-4 gap-3">
      <!-- Mapped stats for quick view -->
      {#each [
        { label: 'Focus', val: globalState.stats.productivity, color: 'text-teal-400', bg: 'bg-teal-500/10', icon: Zap, route: routeByKey.focus },
        { label: 'Health', val: globalState.stats.health, color: 'text-rose-400', bg: 'bg-rose-500/10', icon: Heart, route: routeByKey.health },
        { label: 'Finance', val: globalState.stats.finance, color: 'text-green-400', bg: 'bg-green-500/10', icon: Wallet, route: routeByKey.finance },
        { label: 'Habits', val: globalState.stats.habits, color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: ListChecks, route: routeByKey.habits }
      ] as sys}
        <button
          type="button"
          class="flex flex-col items-center gap-2 cursor-pointer group transition-all hover:scale-105 active:scale-95 relative z-10"
          onclick={() => { haptic(HAPTIC_PATTERNS.light); goto(sys.route); }}
          aria-label={`Open ${sys.label}`}
        >
          {#if isLoading}
            <Skeleton width="w-12" height="h-12" rounded="rounded-2xl" />
          {:else}
            <div class="w-12 h-12 {sys.bg} {sys.color} rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
              <sys.icon size={20} />
            </div>
            <span class="text-[9px] font-bold uppercase text-zinc-500">{sys.label}</span>
          {/if}
        </button>
      {/each}
    </div>
  </section>
</div>

<style>
  :global(.text-rose-400) { color: #fb7185; }
  :global(.bg-rose-500) { background-color: #f43f5e; }
</style>
