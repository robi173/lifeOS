<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import { Play, Square, CheckSquare, Clock, Trophy, Flame, Plus, X, Timer } from 'lucide-svelte';
  import { haptic, HAPTIC_PATTERNS } from '$lib/haptics';
  import { globalState, type Task } from '$lib/state.svelte';
  import { playMechanicalClick, playSuccessChime } from '$lib/sounds';
  import { onMount } from 'svelte';

  // --- Pomodoro Logic ---
  let timeLeft = $state(25 * 60);
  let isRunning = $state(false);
  let interval: any;
  let showTimeInput = $state(false);
  let customMinutes = $state(25);
  let customSeconds = $state(0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (isRunning) {
      clearInterval(interval);
      isRunning = false;
      haptic(HAPTIC_PATTERNS.medium);
    } else {
      isRunning = true;
      haptic(HAPTIC_PATTERNS.snap);
      interval = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft -= 1;
        } else {
          finishTimer();
        }
      }, 1000);
    }
  };

  const finishTimer = () => {
    clearInterval(interval);
    isRunning = false;
    playSuccessChime();
    haptic(HAPTIC_PATTERNS.heavy);
    globalState.incrementStreak();
    timeLeft = customMinutes * 60 + customSeconds;
  };

  const setCustomTime = () => {
    timeLeft = customMinutes * 60 + customSeconds;
    showTimeInput = false;
    haptic(HAPTIC_PATTERNS.snap);
  };

  // --- Task Logic ---
  let showAddModal = $state(false);
  let newTaskTitle = $state('');
  let newTaskPriority = $state<'High' | 'Medium' | 'Maintenance'>('Medium');
  let newTaskTime = $state('12:00');

  const activeTasks = $derived(globalState.tasks.filter(t => !t.completed));
  const completedTasks = $derived(globalState.tasks.filter(t => t.completed));

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    globalState.addTask(newTaskTitle, newTaskPriority, newTaskTime);
    newTaskTitle = '';
    showAddModal = false;
    haptic(HAPTIC_PATTERNS.snap);
    playMechanicalClick();
  };

  const toggleTask = (id: number) => {
    globalState.toggleTask(id);
    haptic(HAPTIC_PATTERNS.medium);
  };

  // --- Progress Logic ---
  // progress for "SWP App Development" based on tasks containing "SWP"
  const swpTasks = $derived(globalState.tasks.filter(t => t.title.toLowerCase().includes('swp')));
  const swpProgress = $derived(() => {
    if (swpTasks.length === 0) return 75; // baseline
    const completed = swpTasks.filter(t => t.completed).length;
    return Math.round((completed / swpTasks.length) * 100);
  });

  onMount(() => {
    // Listen for FAB actions if dispatched from layout
    const handleFabAction = (e: any) => {
      if (e.detail.type === 'task') {
        showAddModal = true;
      }
    };
    document.addEventListener('fab-action', handleFabAction);
    return () => document.removeEventListener('fab-action', handleFabAction);
  });
</script>

<div class="space-y-6 pb-6">
  <header class="space-y-1">
    <h1 class="text-3xl font-bold tracking-tight">Focus</h1>
    <p class="text-yellow-400 font-medium text-sm">
      Status: {isRunning ? 'Focusing...' : 'Ready'}
    </p>
  </header>

  <!-- Pomodoro Engine -->
  <section>
    <Card glowColor="yellow" class="flex flex-col items-center py-8 relative overflow-hidden">
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div 
        onclick={() => { showTimeInput = true; haptic(HAPTIC_PATTERNS.light); }} 
        class="relative cursor-pointer select-none active:scale-95 transition-transform group">
        <div class="text-6xl font-mono font-bold tracking-tight mb-2 neon-text-teal drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] transition-all group-hover:brightness-125">
          {formatTime(timeLeft)}
        </div>
        <div class="absolute -top-4 -right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Clock size={16} class="text-zinc-500" />
        </div>
      </div>
      <p class="text-zinc-400 text-sm font-medium mb-6">Pomodoro Session</p>
      
      <div class="flex items-center gap-4">
        <button 
          onclick={startTimer}
          class="relative z-10 w-16 h-16 rounded-full {isRunning ? 'bg-zinc-800 text-yellow-500' : 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-zinc-950'} flex items-center justify-center concave-button transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)]">
          {#if isRunning}
            <Square size={24} fill="currentColor" />
          {:else}
            <Play size={28} fill="currentColor" class="ml-1" />
          {/if}
        </button>
      </div>
    </Card>
  </section>

  <!-- Custom Time Modal -->
  {#if showTimeInput}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4" onclick={() => showTimeInput = false}>
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div class="relative glass rounded-3xl p-6 w-full max-w-xs animate-zoom-fade-in border border-zinc-700/50" onclick={(e) => e.stopPropagation()}>
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <Timer size={20} class="text-yellow-400" />
          Set Timer
        </h3>
        <div class="flex items-center gap-4 mb-6">
          <div class="flex-1">
            <label class="text-[10px] text-zinc-500 uppercase block mb-1">Minutes</label>
            <input type="number" bind:value={customMinutes} min="1" max="120" class="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 font-mono" />
          </div>
          <div class="flex-1">
            <label class="text-[10px] text-zinc-500 uppercase block mb-1">Seconds</label>
            <input type="number" bind:value={customSeconds} min="0" max="59" class="w-full bg-zinc-800 border-zinc-700 rounded-lg p-2 font-mono" />
          </div>
        </div>
        <button onclick={setCustomTime} class="w-full bg-yellow-500 text-zinc-950 font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors">
          Update Time
        </button>
      </div>
    </div>
  {/if}

  <!-- Stats Row -->
  <section class="grid grid-cols-3 gap-3 perspective-1000">
    <Card class="flex flex-col items-center justify-center p-3 tilt-card bg-zinc-900/80 border-t-zinc-700/50">
      <Flame size={18} class="text-orange-400 mb-1" />
      <span class="font-mono font-bold text-lg">{globalState.streak}</span>
      <span class="text-[10px] text-zinc-500 font-medium uppercase">Streak</span>
    </Card>
    <Card class="flex flex-col items-center justify-center p-3 tilt-card bg-zinc-900/80 border-t-zinc-700/50">
      <Clock size={18} class="text-teal-400 mb-1" />
      <span class="font-mono font-bold text-lg">4h</span>
      <span class="text-[10px] text-zinc-500 font-medium uppercase">Focus Avg</span>
    </Card>
    <Card class="flex flex-col items-center justify-center p-3 tilt-card bg-zinc-900/80 border-t-zinc-700/50">
      <Trophy size={18} class="text-yellow-400 mb-1" />
      <span class="font-mono font-bold text-lg">A+</span>
      <span class="text-[10px] text-zinc-500 font-medium uppercase">Rank</span>
    </Card>
  </section>

  <!-- Active Task List -->
  <section>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase">Active Tasks</h3>
      <button 
        onclick={() => { showAddModal = true; haptic(HAPTIC_PATTERNS.light); }}
        class="text-teal-400 hover:text-teal-300 transition-colors">
        <Plus size={20} />
      </button>
    </div>
    <div class="space-y-3">
      {#each activeTasks as task (task.id)}
        <Card class="!p-4 flex items-center gap-4 transition-all duration-300 animate-zoom-fade-in">
          <button 
            onclick={() => toggleTask(task.id)} 
            class="w-6 h-6 rounded border border-zinc-700 bg-zinc-800 flex items-center justify-center transition-all hover:border-teal-500">
          </button>
          
          <div class="flex-1">
            <h4 class="font-medium text-sm text-zinc-100">{task.title}</h4>
            <div class="flex items-center gap-3 mt-1">
              <span class="text-[10px] font-mono text-zinc-500 font-medium">{task.time}</span>
              {#if task.priority === 'High'}
                <span class="text-[10px] font-bold text-rose-300 bg-rose-900/40 px-2 py-0.5 rounded border border-rose-800">High</span>
              {:else if task.priority === 'Medium'}
                <span class="text-[10px] font-bold text-yellow-900 bg-yellow-400 px-2 py-0.5 rounded">Medium</span>
              {:else}
                <span class="text-[10px] font-medium text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/50">Maintenance</span>
              {/if}
            </div>
          </div>
        </Card>
      {/each}
      
      {#if activeTasks.length === 0}
        <div class="text-center py-8 text-zinc-600 italic text-sm">
          No active tasks. Time for deep work?
        </div>
      {/if}
    </div>
  </section>

  <!-- Completed Tasks -->
  {#if completedTasks.length > 0}
    <section>
      <h3 class="text-sm font-semibold text-zinc-500 tracking-wide uppercase mb-3">Completed</h3>
      <div class="space-y-3">
        {#each completedTasks as task (task.id)}
          <Card class="!p-4 flex items-center gap-4 opacity-50 transition-all duration-300">
            <button 
              onclick={() => toggleTask(task.id)} 
              class="w-6 h-6 rounded border border-teal-400 bg-teal-500 flex items-center justify-center transition-all">
              <CheckSquare size={16} class="text-zinc-950" strokeWidth={3} />
            </button>
            <div class="flex-1">
              <h4 class="font-medium text-sm line-through text-zinc-500">{task.title}</h4>
            </div>
          </Card>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Projects -->
  <section>
    <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase mb-3">Projects & Courses</h3>
    <Card class="space-y-4">
      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="font-medium text-sm">SWP App Development</span>
          <span class="font-mono text-xs text-teal-400">{swpProgress()}%</span>
        </div>
        <ProgressBar progress={swpProgress()} color="teal" />
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

<!-- Add Task Modal -->
{#if showAddModal}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4" onclick={() => showAddModal = false}>
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
    <div class="relative glass rounded-3xl p-6 w-full max-w-sm animate-zoom-fade-in border border-zinc-700/50" onclick={(e) => e.stopPropagation()}>
      <div class="flex items-center justify-between mb-5">
        <h3 class="text-lg font-semibold">New Focus Task</h3>
        <button class="text-zinc-500 hover:text-zinc-300" onclick={() => showAddModal = false}><X size={20} /></button>
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="text-[10px] text-zinc-500 uppercase block mb-1">Task Title</label>
          <input 
            bind:value={newTaskTitle}
            placeholder="What are we focusing on?"
            class="w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 text-zinc-100 focus:border-teal-500 focus:ring-0 transition-colors" />
        </div>
        
        <div class="flex gap-3">
          <div class="flex-1">
            <label class="text-[10px] text-zinc-500 uppercase block mb-1">Time</label>
            <input type="time" bind:value={newTaskTime} class="w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 text-zinc-100" />
          </div>
          <div class="flex-1">
            <label class="text-[10px] text-zinc-500 uppercase block mb-1">Priority</label>
            <select bind:value={newTaskPriority} class="w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 text-zinc-100">
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>
        
        <button 
          onclick={addTask}
          class="w-full bg-teal-500 text-zinc-950 font-bold py-4 rounded-2xl hover:bg-teal-400 transition-all active:scale-95 shadow-[0_4px_20px_rgba(20,184,166,0.3)] mt-2">
          Create Task
        </button>
      </div>
    </div>
  </div>
{/if}
