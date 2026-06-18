<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import { Moon, Activity, Droplets, Utensils, Pill, X, Coffee, Apple, Dumbbell, ChevronDown } from 'lucide-svelte';
  import { haptic, HAPTIC_PATTERNS } from '$lib/haptics';
  import { playMechanicalClick, playWaterDrop, playSuccessChime } from '$lib/sounds';
  import { onMount } from 'svelte';

  // --- State ---
  let healthScore = $state(84);
  let sleepScore = $state(92);
  let activityScore = $state(76);

  let showDeepDive = $state(false);
  let ringAnimating = $state(false);
  let deepSleepExpanded = $state(false);
  let stepsExpanded = $state(false);
  let deepSleepPressed = $state(false);
  let stepsPressed = $state(false);
  let textGlowSleep = $state(false);
  let textGlowSteps = $state(false);

  let waterMl = $state(1500);
  const waterGoal = 3000;
  let waterWaveActive = $state(false);
  let waterGoalReached = $derived(waterMl >= waterGoal);

  let showNutritionModal = $state(false);
  let loggedMeals = $state(new Set<string>());

  let supplements = $state([
    { id: 1, name: 'Vitamin D3 + K2', time: 'Morning', dose: '5000 IU', checked: true, color: 'text-yellow-400', animating: false, pillFlash: false },
    { id: 2, name: 'Magnesium Glycinate', time: 'Evening', dose: '400mg', checked: false, color: 'text-indigo-400', animating: false, pillFlash: false },
    { id: 3, name: 'Omega-3 Fish Oil', time: 'Morning', dose: '2000mg', checked: false, color: 'text-blue-400', animating: false, pillFlash: false },
    { id: 4, name: 'Zinc + Copper', time: 'Evening', dose: '30mg', checked: false, color: 'text-orange-400', animating: false, pillFlash: false }
  ]);

  let glowBursts = $state<Array<{id: number, x: number, y: number}>>([]);
  let nextBurstId = $state(0);

  const sleepData7d = [85, 70, 90, 65, 95, 80, 105];
  const stepsData7d = [6200, 8100, 7300, 9500, 5800, 8432, 7100];
  const dayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const mealOptions = [
    { name: 'Breakfast', icon: Coffee },
    { name: 'Lunch', icon: Utensils },
    { name: 'Dinner', icon: Moon },
    { name: 'Snack', icon: Apple }
  ];

  // --- Helpers ---
  function triggerGlow(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const id = nextBurstId++;
    glowBursts = [...glowBursts, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }];
    setTimeout(() => { glowBursts = glowBursts.filter(b => b.id !== id); }, 500);
  }

  function sparkline(data: number[], w: number, h: number): string {
    const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
    const sx = w / (data.length - 1);
    return data.map((v, i) => `${i === 0 ? 'M' : 'L'}${i * sx},${h - ((v - min) / range) * h * 0.8 - h * 0.1}`).join(' ');
  }

  function handleRingClick(e: MouseEvent) {
    triggerGlow(e);
    ringAnimating = true;
    haptic(HAPTIC_PATTERNS.medium);
    setTimeout(() => { showDeepDive = true; ringAnimating = false; }, 500);
  }

  function handleSleepClick(e: MouseEvent) {
    triggerGlow(e);
    haptic(HAPTIC_PATTERNS.light);
    deepSleepPressed = true;
    textGlowSleep = true;
    setTimeout(() => { deepSleepPressed = false; textGlowSleep = false; }, 300);
    deepSleepExpanded = !deepSleepExpanded;
  }

  function handleStepsClick(e: MouseEvent) {
    triggerGlow(e);
    haptic(HAPTIC_PATTERNS.light);
    stepsPressed = true;
    textGlowSteps = true;
    setTimeout(() => { stepsPressed = false; textGlowSteps = false; }, 300);
    stepsExpanded = !stepsExpanded;
  }

  function handleWaterClick(e: MouseEvent) {
    triggerGlow(e);
    addWater();
  }

  function handleNutritionClick(e: MouseEvent) {
    triggerGlow(e);
    haptic(HAPTIC_PATTERNS.light);
    showNutritionModal = true;
  }

  function toggleMeal(name: string) {
    haptic(HAPTIC_PATTERNS.light);
    if (loggedMeals.has(name)) { loggedMeals.delete(name); } else { loggedMeals.add(name); }
    loggedMeals = new Set(loggedMeals);
  }

  function toggleSupplement(id: number, e: MouseEvent) {
    triggerGlow(e);
    toggleSupplementById(id);
  }

  function addWater() {
    if (waterMl >= waterGoal) return;
    waterMl += 250;
    waterWaveActive = true;
    playWaterDrop();
    haptic(HAPTIC_PATTERNS.light);
    if (waterMl >= waterGoal) {
      playSuccessChime();
      haptic(HAPTIC_PATTERNS.heavy);
    }
    setTimeout(() => {
      waterWaveActive = false;
    }, 600);
  }

  function toggleSupplementById(id: number) {
    playMechanicalClick();
    haptic(HAPTIC_PATTERNS.snap);
    const s = supplements.find(x => x.id === id);
    if (s) {
      s.checked = !s.checked;
      if (s.checked) { s.animating = true; s.pillFlash = true; }
      setTimeout(() => { if (s) { s.animating = false; s.pillFlash = false; } }, 500);
    }
  }

  onMount(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ type?: string }>;
      const type = custom.detail?.type;

      if (type === 'water') {
        addWater();
      } else if (type === 'training') {
        showDeepDive = true;
        haptic(HAPTIC_PATTERNS.medium);
      } else if (type === 'supplement') {
        const nextOpen = supplements.find(s => !s.checked) ?? supplements[0];
        if (nextOpen) {
          toggleSupplementById(nextOpen.id);
        }
      }
    };

    document.addEventListener('fab-action', handler);
    return () => document.removeEventListener('fab-action', handler);
  });
</script>

<div class="space-y-6 pb-6">
  <header class="space-y-1">
    <h1 class="text-3xl font-bold tracking-tight">Health</h1>
    <p class="text-green-400 font-medium text-sm">Recovery is optimal. Ready to train.</p>
  </header>

  <!-- Health Score Ring -->
  <section>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="glass rounded-2xl p-5 hover-float border border-zinc-700/50 shadow-[0_0_15px_rgba(34,197,94,0.15)] flex items-center gap-6 cursor-pointer relative overflow-hidden select-none"
      onclick={handleRingClick}
    >
      {#each glowBursts as burst (burst.id)}
        <div class="absolute w-24 h-24 rounded-full bg-green-400/30 blur-xl animate-glow-burst pointer-events-none" style="left:{burst.x}px;top:{burst.y}px"></div>
      {/each}
      <div class="relative w-24 h-24 flex items-center justify-center perspective-1000">
        <div class={ringAnimating ? 'animate-ring-3d' : ''}>
          <svg class="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
            <path class="text-zinc-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3" />
            <path class="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" stroke-dasharray="{healthScore}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-2xl font-mono font-bold text-zinc-100">{healthScore}</span>
          </div>
        </div>
      </div>
      <div class="flex-1 space-y-2">
        <h2 class="font-semibold text-lg">Health Score</h2>
        <div class="space-y-1">
          <div class="flex justify-between text-xs"><span class="text-zinc-400">Sleep</span><span class="font-mono text-green-400">{sleepScore}%</span></div>
          <div class={showDeepDive ? 'animate-breathe' : ''}><ProgressBar progress={sleepScore} color="green" height="h-1" /></div>
        </div>
        <div class="space-y-1">
          <div class="flex justify-between text-xs mt-1"><span class="text-zinc-400">Activity</span><span class="font-mono text-teal-400">{activityScore}%</span></div>
          <div class={showDeepDive ? 'animate-breathe' : ''}><ProgressBar progress={activityScore} color="teal" height="h-1" /></div>
        </div>
      </div>
      <ChevronDown size={16} class="text-zinc-500" />
    </div>
  </section>

  <!-- Deep Dive Overlay -->
  {#if showDeepDive}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4" onclick={() => showDeepDive = false}>
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div class="relative glass rounded-3xl p-6 w-full max-w-sm animate-zoom-fade-in border border-zinc-700/50" onclick={(e) => e.stopPropagation()}>
        <button class="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors" onclick={() => showDeepDive = false}><X size={20} /></button>
        <h3 class="text-lg font-semibold mb-4">Health Deep Dive</h3>
        <div class="flex items-center justify-center mb-6">
          <div class="relative w-32 h-32">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path class="text-zinc-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="2.5" />
              <path class="text-green-500" stroke-dasharray="{healthScore}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-3xl font-mono font-bold text-zinc-100">{healthScore}</span>
              <span class="text-[10px] text-zinc-500 uppercase tracking-wider">Score</span>
            </div>
          </div>
        </div>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-sm mb-1.5"><span class="text-zinc-300">Sleep Quality</span><span class="font-mono text-green-400 font-semibold">{sleepScore}%</span></div>
            <div class="animate-breathe"><ProgressBar progress={sleepScore} color="green" height="h-2" /></div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1.5"><span class="text-zinc-300">Activity Level</span><span class="font-mono text-teal-400 font-semibold">{activityScore}%</span></div>
            <div class="animate-breathe"><ProgressBar progress={activityScore} color="teal" height="h-2" /></div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1.5"><span class="text-zinc-300">Hydration</span><span class="font-mono text-cyan-400 font-semibold">{Math.round(waterMl / waterGoal * 100)}%</span></div>
            <div class="animate-breathe"><ProgressBar progress={Math.round(waterMl / waterGoal * 100)} color="teal" height="h-2" /></div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Sleep & Steps Cards -->
  <section class="grid grid-cols-2 gap-4">
    <!-- Deep Sleep -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="glass rounded-2xl p-5 hover-float border border-zinc-700/50 cursor-pointer relative overflow-hidden select-none transition-all duration-300 {deepSleepPressed ? 'animate-card-press' : ''}"
      onclick={handleSleepClick}
    >
      {#each glowBursts as burst (burst.id)}
        <div class="absolute w-20 h-20 rounded-full bg-indigo-400/30 blur-xl animate-glow-burst pointer-events-none" style="left:{burst.x}px;top:{burst.y}px"></div>
      {/each}
      <div class="flex items-center gap-2 text-indigo-400 mb-3">
        <Moon size={18} /><span class="font-medium text-sm">Deep Sleep</span>
        <ChevronDown size={14} class="ml-auto text-zinc-600 transition-transform duration-300 {deepSleepExpanded ? 'rotate-180' : ''}" />
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-2xl font-mono font-bold {textGlowSleep ? 'animate-text-glow' : ''}">1h 45m</span>
      </div>
      <div class="mt-3"><ProgressBar progress={80} color="teal" height="h-1.5" /></div>
      {#if deepSleepExpanded}
        <div class="animate-slide-expand mt-4 pt-3 border-t border-zinc-800">
          <p class="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Last 7 Days (min)</p>
          <svg viewBox="0 0 140 50" class="w-full h-12">
            <path d={sparkline(sleepData7d, 140, 50)} fill="none" stroke="rgba(129,140,248,0.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            {#each sleepData7d as val, i}
              <circle cx={i * (140 / 6)} cy={50 - ((val - Math.min(...sleepData7d)) / (Math.max(...sleepData7d) - Math.min(...sleepData7d) || 1)) * 40 - 5} r="2.5" fill="rgb(129,140,248)" />
            {/each}
          </svg>
          <div class="flex justify-between mt-1">
            {#each dayLabels as d}<span class="text-[8px] text-zinc-600">{d}</span>{/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Steps -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="glass rounded-2xl p-5 hover-float border border-zinc-700/50 cursor-pointer relative overflow-hidden select-none transition-all duration-300 {stepsPressed ? 'animate-card-press' : ''}"
      onclick={handleStepsClick}
    >
      {#each glowBursts as burst (burst.id)}
        <div class="absolute w-20 h-20 rounded-full bg-orange-400/30 blur-xl animate-glow-burst pointer-events-none" style="left:{burst.x}px;top:{burst.y}px"></div>
      {/each}
      <div class="flex items-center gap-2 text-orange-400 mb-3">
        <Activity size={18} /><span class="font-medium text-sm">Steps</span>
        <ChevronDown size={14} class="ml-auto text-zinc-600 transition-transform duration-300 {stepsExpanded ? 'rotate-180' : ''}" />
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-2xl font-mono font-bold {textGlowSteps ? 'animate-text-glow' : ''}">8,432</span>
      </div>
      <div class="mt-3"><ProgressBar progress={65} color="yellow" height="h-1.5" /></div>
      {#if stepsExpanded}
        <div class="animate-slide-expand mt-4 pt-3 border-t border-zinc-800">
          <p class="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Last 7 Days</p>
          <svg viewBox="0 0 140 50" class="w-full h-12">
            <path d={sparkline(stepsData7d, 140, 50)} fill="none" stroke="rgba(251,146,60,0.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            {#each stepsData7d as val, i}
              <circle cx={i * (140 / 6)} cy={50 - ((val - Math.min(...stepsData7d)) / (Math.max(...stepsData7d) - Math.min(...stepsData7d) || 1)) * 40 - 5} r="2.5" fill="rgb(251,146,60)" />
            {/each}
          </svg>
          <div class="flex justify-between mt-1">
            {#each dayLabels as d}<span class="text-[8px] text-zinc-600">{d}</span>{/each}
          </div>
        </div>
      {/if}
    </div>
  </section>

  <!-- Daily Check-ins -->
  <section>
    <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase mb-3">Daily Check-ins</h3>
    <div class="grid grid-cols-2 gap-3">
      <!-- Water -->
      <button
        class="relative overflow-hidden rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 border active:scale-95 {waterGoalReached ? 'bg-cyan-500/10 border-cyan-500/40 animate-cyan-glow' : 'bg-zinc-800/60 border-zinc-700/50 hover:bg-zinc-800'}"
        onclick={handleWaterClick}
      >
        {#if waterWaveActive}
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-16 h-16 rounded-full bg-cyan-400/30 animate-water-ripple"></div>
          </div>
        {/if}
        <Droplets size={24} class={waterGoalReached ? 'text-cyan-300' : 'text-blue-400'} />
        <span class="text-sm font-medium {waterGoalReached ? 'text-cyan-300' : 'text-zinc-300'}">
          Water: {(waterMl / 1000).toFixed(1)}L
        </span>
        <div class="w-full bg-zinc-700/50 rounded-full h-1 mt-1">
          <div class="h-full rounded-full transition-all duration-500 {waterGoalReached ? 'bg-cyan-400' : 'bg-blue-500'}" style="width: {Math.min(100, waterMl / waterGoal * 100)}%"></div>
        </div>
        <span class="text-[9px] text-zinc-500 font-mono">{waterGoalReached ? '✓ Goal reached!' : `+250ml → ${(waterGoal / 1000).toFixed(1)}L goal`}</span>
      </button>

      <!-- Nutrition -->
      <button
        class="bg-zinc-800/60 border border-zinc-700/50 hover:bg-zinc-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-200 active:scale-95 relative overflow-hidden"
        onclick={handleNutritionClick}
      >
        <Utensils size={24} class="text-green-400" />
        <span class="text-sm font-medium text-zinc-300">Nutrition</span>
        {#if loggedMeals.size > 0}
          <span class="text-[9px] text-green-400 font-mono">{loggedMeals.size}/4 logged</span>
        {/if}
      </button>
    </div>
  </section>

  <!-- Nutrition Modal -->
  {#if showNutritionModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="fixed inset-0 z-50 flex items-end justify-center p-4" onclick={() => showNutritionModal = false}>
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div class="relative w-full max-w-sm rounded-3xl p-6 animate-zoom-fade-in border border-zinc-600/30" style="background: rgba(24,24,27,0.75); backdrop-filter: blur(24px);" onclick={(e) => e.stopPropagation()}>
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-semibold">Log Meal</h3>
          <button class="text-zinc-500 hover:text-zinc-300 transition-colors" onclick={() => showNutritionModal = false}><X size={20} /></button>
        </div>
        <div class="grid grid-cols-2 gap-3">
          {#each mealOptions as meal}
            <button
              class="flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 active:scale-95 {loggedMeals.has(meal.name) ? 'bg-green-500/15 border-green-500/40 text-green-400' : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800'}"
              onclick={() => toggleMeal(meal.name)}
            >
              <meal.icon size={28} />
              <span class="text-xs font-medium">{meal.name}</span>
              {#if loggedMeals.has(meal.name)}
                <span class="text-[9px] font-mono text-green-500">✓ Logged</span>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- Supplement Stack -->
  <section>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase">Supplement Stack</h3>
      <span class="text-[10px] font-mono text-zinc-500">{supplements.filter(s => s.checked).length}/{supplements.length}</span>
    </div>
    <Card class="space-y-3">
      {#each supplements as supp (supp.id)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="flex items-center justify-between rounded-xl p-2 -mx-2 transition-all duration-500 cursor-pointer select-none hover:bg-zinc-800/50 active:scale-[0.98]"
          style="opacity: {supp.checked ? 0.5 : 1}; transform: translateY({supp.checked ? '2px' : '0px'})"
          onclick={(e) => toggleSupplement(supp.id, e)}
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-zinc-800 rounded-lg {supp.pillFlash ? 'animate-pill-flash' : ''}">
              <Pill size={16} class={supp.color} />
            </div>
            <div>
              <h4 class="text-sm font-medium {supp.checked ? 'line-through text-zinc-500' : ''}">{supp.name}</h4>
              <p class="text-[10px] text-zinc-500 font-mono mt-0.5">{supp.time} • {supp.dose}</p>
            </div>
          </div>
          <div class="w-6 h-6 rounded border flex items-center justify-center transition-all duration-200 {supp.checked ? 'border-green-500/50 bg-green-500/10' : 'border-zinc-700 bg-zinc-800'}">
            {#if supp.checked}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="w-3.5 h-3.5 text-green-400 {supp.animating ? 'animate-bounce-in' : ''}">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            {/if}
          </div>
        </div>
      {/each}
    </Card>
  </section>
</div>
