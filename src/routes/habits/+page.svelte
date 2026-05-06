<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import { BookOpen, Dumbbell, Brain, Bed, Droplets, Check, X, Flame } from 'lucide-svelte';

  const habits = [
    { id: 1, title: 'Read 20 pages', icon: BookOpen, color: 'text-blue-400', streak: 12, completed: true },
    { id: 2, title: 'Workout', icon: Dumbbell, color: 'text-rose-400', streak: 4, completed: false },
    { id: 3, title: 'Meditation', icon: Brain, color: 'text-purple-400', streak: 21, completed: true },
    { id: 4, title: 'Sleep 8 Hours', icon: Bed, color: 'text-indigo-400', streak: 0, completed: false },
    { id: 5, title: 'Drink 2L Water', icon: Droplets, color: 'text-cyan-400', streak: 45, completed: true }
  ];

  const level = 12;
  const xp = 850;
  const nextLevelXp = 1000;
  const xpPercent = (xp / nextLevelXp) * 100;
  
  const toggleHabit = (id: number) => {
    const habit = habits.find(h => h.id === id);
    if (habit) habit.completed = !habit.completed;
  };
</script>

<div class="space-y-6 pb-6">
  <header class="space-y-1">
    <h1 class="text-3xl font-bold tracking-tight">Habits</h1>
    <p class="text-purple-400 font-medium text-sm">Building the foundation.</p>
  </header>

  <!-- Level Progress -->
  <section>
    <Card glowColor="purple" class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full border-2 border-purple-500 flex items-center justify-center bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <span class="font-mono font-bold text-lg text-purple-400">{level}</span>
          </div>
          <div>
            <h2 class="font-semibold text-zinc-100">Consistency Level</h2>
            <p class="text-xs text-zinc-400 font-mono">Master Builder</p>
          </div>
        </div>
        <div class="text-right">
          <span class="text-sm font-mono text-zinc-300">{xp} / {nextLevelXp} XP</span>
        </div>
      </div>
      <ProgressBar progress={xpPercent} color="teal" />
    </Card>
  </section>

  <!-- Daily Habits -->
  <section>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase">Today's Habits</h3>
      <span class="text-xs font-mono text-zinc-500">3/5 Done</span>
    </div>
    
    <div class="space-y-3">
      {#each habits as habit}
        {@const Icon = habit.icon}
        <Card class="!p-0 overflow-hidden flex transition-all duration-300 {habit.completed ? 'opacity-70' : ''}">
          <!-- Status indicator strip -->
          <div class="w-1.5 {habit.completed ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]' : 'bg-zinc-800'}"></div>
          
          <div class="flex-1 p-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-zinc-800 rounded-lg {habit.color}">
                <Icon size={20} />
              </div>
              <div>
                <h4 class="font-medium text-sm text-zinc-100 {habit.completed ? 'line-through text-zinc-400' : ''}">{habit.title}</h4>
                <div class="flex items-center gap-1 mt-0.5 text-orange-400">
                  <Flame size={12} />
                  <span class="text-[10px] font-mono font-medium">{habit.streak} day streak</span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              {#if habit.completed}
                <button onclick={() => toggleHabit(habit.id)} class="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center hover:bg-teal-500/30 transition-colors">
                  <Check size={16} strokeWidth={3} />
                </button>
              {:else}
                <button onclick={() => toggleHabit(habit.id)} class="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-500 hover:text-teal-400 hover:border-teal-500/50 flex items-center justify-center transition-colors">
                  <Check size={16} />
                </button>
              {/if}
            </div>
          </div>
        </Card>
      {/each}
    </div>
  </section>

  <!-- Routines -->
  <section>
    <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase mb-3">Active Routines</h3>
    <Card class="flex items-center justify-between">
      <div>
        <h4 class="font-medium text-sm text-zinc-100">Morning Protocol</h4>
        <p class="text-xs text-zinc-500 mt-1">Water, Meditate, Read</p>
      </div>
      <div class="w-10 h-10 rounded-full border-2 border-teal-500 flex items-center justify-center">
        <Check size={20} class="text-teal-500" strokeWidth={3} />
      </div>
    </Card>
  </section>
</div>
