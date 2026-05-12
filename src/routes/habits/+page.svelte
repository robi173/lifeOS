<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import { CheckCircle2, Circle, Flame, Calendar, Plus } from 'lucide-svelte';
  import { haptic, HAPTIC_PATTERNS } from '$lib/haptics';

  let habits = $state([
    { id: 1, title: 'Cold Shower', streak: 12, completed: true },
    { id: 2, title: 'Read 20 Pages', streak: 45, completed: false },
    { id: 3, title: 'Meditation', streak: 8, completed: true },
    { id: 4, title: 'Morning Exercise', streak: 2, completed: false },
  ]);

  const toggleHabit = (id: number) => {
    const habit = habits.find(h => h.id === id);
    if (habit) {
      habit.completed = !habit.completed;
      haptic(HAPTIC_PATTERNS.medium);
    }
  };
</script>

<div class="space-y-6 pb-6">
  <header class="flex justify-between items-end">
    <div class="space-y-1">
      <h1 class="text-3xl font-bold tracking-tight text-yellow-400">Habits</h1>
      <p class="text-zinc-500 font-medium text-sm">Consistency is Key</p>
    </div>
    <div class="text-right">
      <p class="text-[10px] text-zinc-500 uppercase font-bold">Daily Score</p>
      <p class="text-2xl font-mono font-bold text-yellow-400">95%</p>
    </div>
  </header>

  <!-- Habit Grid -->
  <section class="grid gap-3">
    {#each habits as habit (habit.id)}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <Card 
        class="!p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all {habit.completed ? 'bg-yellow-400/5 border-yellow-500/20' : ''}"
        onclick={() => toggleHabit(habit.id)}>
        <div class="flex items-center gap-4">
          <div class="{habit.completed ? 'text-yellow-400' : 'text-zinc-700'}">
            {#if habit.completed}
              <CheckCircle2 size={24} />
            {:else}
              <Circle size={24} />
            {/if}
          </div>
          <div>
            <h4 class="font-medium text-sm {habit.completed ? 'text-zinc-100' : 'text-zinc-400'}">{habit.title}</h4>
            <div class="flex items-center gap-2 mt-0.5">
              <Flame size={12} class="text-orange-500" />
              <span class="text-[10px] font-bold text-orange-500/80">{habit.streak} DAY STREAK</span>
            </div>
          </div>
        </div>
        
        <div class="flex gap-1">
          {#each Array(5) as _, i}
            <div class="w-1.5 h-4 rounded-full {i === 4 && !habit.completed ? 'bg-zinc-800' : 'bg-yellow-500/40'}"></div>
          {/each}
        </div>
      </Card>
    {/each}
    
    <button class="w-full py-4 border border-dashed border-zinc-800 rounded-2xl text-zinc-600 flex items-center justify-center gap-2 hover:bg-zinc-900/40 transition-colors">
      <Plus size={18} />
      <span class="text-sm font-medium uppercase tracking-wider">Add Protocol</span>
    </button>
  </section>

  <!-- Weekly Overview -->
  <section class="space-y-3">
    <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase flex items-center gap-2">
      <Calendar size={16} />
      Weekly Progress
    </h3>
    <Card class="p-4">
      <div class="flex justify-between">
        {#each ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as day, i}
          <div class="flex flex-col items-center gap-2">
            <span class="text-[10px] font-bold text-zinc-500 uppercase">{day}</span>
            <div class="w-8 h-8 rounded-lg {i < 2 ? 'bg-yellow-500' : 'bg-zinc-800'} flex items-center justify-center border border-white/5">
              {#if i < 2}
                <CheckCircle2 size={14} class="text-zinc-900" />
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </Card>
  </section>
</div>
