<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import { Play, Square, CheckSquare, Clock, Trophy, Flame } from 'lucide-svelte';
  import { haptic, HAPTIC_PATTERNS } from '$lib/haptics';

  let tasks = $state([
    { id: 1, title: 'Finish SWP Project', priority: 'High', completed: false, time: '14:00' },
    { id: 2, title: 'Review PRs', priority: 'Medium', completed: true, time: '10:00' },
    { id: 3, title: 'Inbox Zero', priority: 'Maintenance', completed: false, time: '16:00' },
  ]);

  let isFocusing = $state(false);
  let showCyanRing = $state(false);
  let showGoldWave = $state(false);

  const toggleTask = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      haptic(task.completed ? HAPTIC_PATTERNS.snap : HAPTIC_PATTERNS.medium);
    }
  };

  const tapTimer = () => {
    haptic(HAPTIC_PATTERNS.medium);
    showCyanRing = true;
    setTimeout(() => showCyanRing = false, 600);
  };

  const toggleFocus = () => {
    haptic(HAPTIC_PATTERNS.snap);
    isFocusing = !isFocusing;
    if (isFocusing) {
      showGoldWave = true;
      setTimeout(() => showGoldWave = false, 800);
    }
  };
</script>

<div class="space-y-6 pb-6">
  <header class="space-y-1">
    <h1 class="text-3xl font-bold tracking-tight">Productivity</h1>
    <p 
      onpointerenter={() => haptic(HAPTIC_PATTERNS.light)} 
      class="text-yellow-400 font-medium text-sm transition-all duration-300 hover:text-yellow-300 hover:drop-shadow-[0_0_10px_rgba(253,224,71,0.8)] cursor-default">
      Focus Mode: {isFocusing ? 'Active' : 'Ready'}
    </p>
  </header>

  <!-- Focus Engine -->
  <section>
    <Card glowColor="yellow" class="flex flex-col items-center py-8 relative overflow-hidden">
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div onclick={tapTimer} class="relative cursor-pointer select-none active:scale-95 transition-transform">
        {#if showCyanRing}
          <div class="absolute inset-0 rounded-full border-cyan-400 animate-expand-ring"></div>
        {/if}
        <div class="text-6xl font-mono font-bold tracking-tight mb-2 neon-text-teal drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
          25:00
        </div>
      </div>
      <p class="text-zinc-400 text-sm font-medium mb-6">Pomodoro Session</p>
      
      <div class="flex items-center gap-4 relative">
        {#if showGoldWave}
          <div class="absolute inset-0 rounded-full bg-yellow-500 animate-gold-wave z-0 pointer-events-none"></div>
        {/if}
        
        <button 
          onclick={toggleFocus}
          class="relative z-10 w-16 h-16 rounded-full {isFocusing ? 'bg-zinc-800 text-yellow-500' : 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-zinc-950'} flex items-center justify-center concave-button transition-all">
          {#if isFocusing}
            <Square size={24} fill="currentColor" />
          {:else}
            <Play size={28} fill="currentColor" class="ml-1" />
          {/if}
        </button>
      </div>
    </Card>
  </section>

  <!-- Stats Row -->
  <section class="grid grid-cols-3 gap-3 perspective-1000">
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div onpointerenter={() => haptic(HAPTIC_PATTERNS.light)}>
      <Card class="flex flex-col items-center justify-center p-3 tilt-card bg-zinc-900/80 border-t-zinc-700/50">
        <Flame size={18} class="text-orange-400 mb-1" />
        <span class="font-mono font-bold text-lg">12</span>
        <span class="text-[10px] text-zinc-500 font-medium uppercase">Streak</span>
      </Card>
    </div>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div onpointerenter={() => haptic(HAPTIC_PATTERNS.light)}>
      <Card class="flex flex-col items-center justify-center p-3 tilt-card bg-zinc-900/80 border-t-zinc-700/50">
        <Clock size={18} class="text-teal-400 mb-1" />
        <span class="font-mono font-bold text-lg">4h</span>
        <span class="text-[10px] text-zinc-500 font-medium uppercase">Focus Avg</span>
      </Card>
    </div>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div onpointerenter={() => haptic(HAPTIC_PATTERNS.light)}>
      <Card class="flex flex-col items-center justify-center p-3 tilt-card bg-zinc-900/80 border-t-zinc-700/50">
        <Trophy size={18} class="text-yellow-400 mb-1" />
        <span class="font-mono font-bold text-lg">A+</span>
        <span class="text-[10px] text-zinc-500 font-medium uppercase">Rank</span>
      </Card>
    </div>
  </section>

  <!-- Task List -->
  <section>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase">Active Tasks</h3>
    </div>
    <div class="space-y-3">
      {#each tasks as task}
        <Card class="!p-4 flex items-center gap-4 transition-all duration-300 {task.completed ? 'opacity-50' : ''}">
          <!-- Custom Tactile Switch -->
          <button 
            onclick={() => toggleTask(task.id)} 
            aria-checked={task.completed}
            class="w-6 h-6 rounded border border-zinc-700 mech-switch flex items-center justify-center transition-all {task.completed ? 'bg-teal-500 border-teal-400' : 'bg-zinc-800'}">
            {#if task.completed}
              <CheckSquare size={16} class="text-zinc-950" strokeWidth={3} />
            {/if}
          </button>
          
          <div class="flex-1 {task.completed ? 'mix-blend-luminosity' : ''}">
            <h4 class="font-medium text-sm {task.completed ? 'line-through text-zinc-500' : 'text-zinc-100'}">{task.title}</h4>
            <div class="flex items-center gap-3 mt-1">
              <span class="text-[10px] font-mono text-zinc-500 font-medium">{task.time}</span>
              {#if task.priority === 'High'}
                <span class="text-[10px] font-bold text-rose-300 bg-rose-900/40 px-2 py-0.5 rounded shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] noise-texture border border-rose-800">High Priority</span>
              {:else if task.priority === 'Medium'}
                <span class="text-[10px] font-bold text-yellow-900 bg-yellow-400 px-2 py-0.5 rounded shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)] backdrop-blur-sm">Medium</span>
              {:else}
                <span class="text-[10px] font-medium text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/50">Maintenance</span>
              {/if}
            </div>
          </div>
        </Card>
      {/each}
    </div>
  </section>

  <!-- Projects -->
  <section>
    <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase mb-3">Projects & Courses</h3>
    <Card class="space-y-4">
      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="font-medium text-sm">SWP App Development</span>
          <span class="font-mono text-xs text-teal-400">75%</span>
        </div>
        <ProgressBar progress={75} color="teal" />
      </div>
      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="font-medium text-sm">Math Exam Prep</span>
          <span class="font-mono text-xs text-yellow-400">40%</span>
        </div>
        <ProgressBar progress={40} color="yellow" />
      </div>
    </Card>
  </section>
</div>
