<script lang="ts">
  import { onMount } from 'svelte';
  import { CheckCircle2, Circle, Flame, Calendar, Plus, X, Pencil, Trash2 } from 'lucide-svelte';
  import Card from '$lib/components/Card.svelte';
  import { haptic, HAPTIC_PATTERNS } from '$lib/haptics';
  import { playSuccessChime, playMechanicalClick } from '$lib/sounds';
  import {
    habitsStore,
    isHabitActiveOnDay,
    type WeekDay,
  } from '$lib/habits.svelte';

  // ── Derived state ────────────────────────────────────────────
  let week = $derived(habitsStore.getWeek());
  let score = $derived(habitsStore.dailyScore);

  // ── Midnight watcher ─────────────────────────────────────────
  onMount(() => {
    const interval = setInterval(() => habitsStore.checkDayChange(), 30_000);
    return () => clearInterval(interval);
  });

  // ── Context menu ─────────────────────────────────────────────
  let contextMenu = $state<{ habitId: string; x: number; y: number } | null>(null);
  let longPressTimer: ReturnType<typeof setTimeout>;

  function startLongPress(e: PointerEvent, id: string) {
    longPressTimer = setTimeout(() => {
      haptic(HAPTIC_PATTERNS.heavy);
      contextMenu = { habitId: id, x: e.clientX, y: e.clientY };
    }, 400);
  }

  function cancelLongPress() {
    clearTimeout(longPressTimer);
  }

  function handleRightClick(e: MouseEvent, id: string) {
    e.preventDefault();
    contextMenu = { habitId: id, x: e.clientX, y: e.clientY };
  }

  function closeContextMenu() {
    contextMenu = null;
  }

  // ── Add / Edit Modal ─────────────────────────────────────────
  let showModal = $state(false);
  let editingId = $state<string | null>(null);
  let modalTitle = $state('');
  let modalDays = $state<WeekDay[]>([]); // empty = every day

  const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

  function openAddModal() {
    editingId = null;
    modalTitle = '';
    modalDays = [];
    showModal = true;
    haptic(HAPTIC_PATTERNS.medium);
  }

  function openEditModal(id: string) {
    const h = habitsStore.habits.find(h => h.id === id);
    if (!h) return;
    editingId = id;
    modalTitle = h.title;
    modalDays = [...h.activeDays];
    showModal = true;
    closeContextMenu();
    haptic(HAPTIC_PATTERNS.medium);
  }

  function toggleModalDay(day: WeekDay) {
    if (modalDays.includes(day)) {
      modalDays = modalDays.filter(d => d !== day);
    } else {
      modalDays = [...modalDays, day].sort((a, b) => a - b);
    }
    haptic(HAPTIC_PATTERNS.light);
  }

  function submitModal() {
    if (!modalTitle.trim()) return;
    if (editingId) {
      habitsStore.editHabit(editingId, modalTitle, modalDays);
    } else {
      habitsStore.addHabit(modalTitle, modalDays);
    }
    playMechanicalClick();
    showModal = false;
  }

  function deleteHabit(id: string) {
    habitsStore.deleteHabit(id);
    closeContextMenu();
    haptic(HAPTIC_PATTERNS.heavy);
  }

  // ── Toggle with sound ────────────────────────────────────────
  function toggleHabit(id: string) {
    const wasCompleted = habitsStore.todayCompleted.includes(id);
    habitsStore.toggleHabit(id);
    if (!wasCompleted) {
      haptic(HAPTIC_PATTERNS.snap);
      // If all done now, play success chime
      if (habitsStore.dailyScore === 100) {
        setTimeout(() => playSuccessChime(), 100);
      }
    } else {
      haptic(HAPTIC_PATTERNS.light);
    }
  }

  // ── FAB listener ─────────────────────────────────────────────
  onMount(() => {
    const handler = (e: any) => {
      if (e.detail.type === 'habits') openAddModal();
    };
    document.addEventListener('fab-action', handler);
    return () => document.removeEventListener('fab-action', handler);
  });

  // ── Day label helper ─────────────────────────────────────────
  function activeDayLabel(days: WeekDay[]): string {
    if (!days || days.length === 0) return 'Every day';
    if (days.length === 5 && !days.includes(5) && !days.includes(6)) return 'Weekdays';
    if (days.length === 2 && days.includes(5) && days.includes(6)) return 'Weekends';
    return days.map(d => DAY_LABELS[d]).join(' ');
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div class="space-y-5 pb-6" onclick={closeContextMenu}>

  <!-- ── Header ──────────────────────────────────────────────── -->
  <header class="flex justify-between items-end">
    <div class="space-y-1">
      <h1 class="text-3xl font-bold tracking-tight text-yellow-400">Habits</h1>
      <p class="text-zinc-500 font-medium text-sm">Consistency is Key</p>
    </div>
    <div class="text-right">
      <p class="text-[10px] text-zinc-500 uppercase font-bold">Daily Score</p>
      <p class="text-2xl font-mono font-bold {score === 100 ? 'text-green-400' : score >= 75 ? 'text-yellow-400' : 'text-yellow-500'}">
        {score}%
      </p>
    </div>
  </header>

  <!-- ── Habit Cards ───────────────────────────────────────────── -->
  <section class="grid gap-3">
    {#each habitsStore.habits as habit (habit.id)}
      {@const isActiveToday = isHabitActiveOnDay(habit, habitsStore.todayDate)}
      {@const isDone = habitsStore.todayCompleted.includes(habit.id)}
      {@const streak = habitsStore.getStreak(habit.id)}
      {@const pills = habitsStore.getPills(habit.id)}
      {@const dayLabel = activeDayLabel(habit.activeDays)}

      <div class="relative">
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div
          role="button"
          tabindex="0"
          class="glass rounded-2xl !p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all border {isDone ? 'bg-yellow-400/5 border-yellow-500/20' : isActiveToday ? 'border-zinc-800/50' : 'border-zinc-900/50 opacity-50'} hover-float"
          onclick={() => isActiveToday && toggleHabit(habit.id)}
          onkeydown={(e) => e.key === 'Enter' && isActiveToday && toggleHabit(habit.id)}
          onpointerdown={(e) => startLongPress(e, habit.id)}
          onpointerup={cancelLongPress}
          onpointerleave={cancelLongPress}
          oncontextmenu={(e) => handleRightClick(e, habit.id)}
        >
          <!-- Left: check + info -->
          <div class="flex items-center gap-4">
            <div class="shrink-0 {isDone ? 'text-yellow-400' : isActiveToday ? 'text-zinc-700' : 'text-zinc-800'}">
              {#if isDone}
                <CheckCircle2 size={24} />
              {:else}
                <Circle size={24} />
              {/if}
            </div>
            <div>
              <h4 class="font-medium text-sm {isDone ? 'text-zinc-100' : isActiveToday ? 'text-zinc-300' : 'text-zinc-600'}">
                {habit.title}
              </h4>
              <div class="flex items-center gap-3 mt-0.5 flex-wrap">
                <div class="flex items-center gap-1">
                  <Flame size={11} class="text-orange-500" />
                  <span class="text-[10px] font-bold text-orange-500/80">{streak} DAY STREAK</span>
                </div>
                {#if dayLabel !== 'Every day'}
                  <span class="text-[9px] font-medium text-zinc-600 bg-zinc-800/80 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    {dayLabel}
                  </span>
                {/if}
              </div>
            </div>
          </div>

          <!-- Right: 5 consistency pills -->
          <div class="flex gap-1 items-end shrink-0">
            {#each pills as filled, i}
              <div
                class="w-1.5 rounded-full transition-all duration-300 {filled ? 'bg-yellow-400 shadow-[0_0_6px_rgba(234,179,8,0.5)]' : 'bg-zinc-800'}"
                style="height: {12 + i * 2}px"
              ></div>
            {/each}
          </div>
        </div>

        <!-- Context menu -->
        {#if contextMenu?.habitId === habit.id}
          <div
            class="absolute right-0 top-full mt-1 z-50 glass rounded-xl border border-zinc-700/50 overflow-hidden shadow-xl animate-zoom-fade-in min-w-36"
            onclick={(e) => e.stopPropagation()}
          >
            <button
              onclick={() => openEditModal(habit.id)}
              class="flex items-center gap-3 w-full px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
              <Pencil size={14} class="text-yellow-400" />
              Edit Habit
            </button>
            <div class="h-px bg-zinc-800"></div>
            <button
              onclick={() => deleteHabit(habit.id)}
              class="flex items-center gap-3 w-full px-4 py-3 text-sm text-rose-400 hover:bg-zinc-800 transition-colors">
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        {/if}
      </div>
    {/each}

    <!-- Add Protocol button -->
    <button
      onclick={openAddModal}
      class="w-full py-4 border border-dashed border-zinc-800 rounded-2xl text-zinc-600 flex items-center justify-center gap-2 hover:bg-zinc-900/40 hover:border-yellow-500/30 hover:text-yellow-500/60 transition-all">
      <Plus size={18} />
      <span class="text-sm font-medium uppercase tracking-wider">Add Protocol</span>
    </button>
  </section>

  <!-- ── Weekly Progress ────────────────────────────────────── -->
  <section class="space-y-3">
    <h3 class="text-sm font-semibold text-zinc-300 tracking-wide uppercase flex items-center gap-2">
      <Calendar size={16} />
      Weekly Progress
    </h3>
    <Card class="!p-4">
      <div class="flex justify-between">
        {#each week as day}
          <div class="flex flex-col items-center gap-2">
            <span class="text-[10px] font-bold {day.isToday ? 'text-yellow-400' : 'text-zinc-500'} uppercase">
              {day.label}
            </span>
            <div class="relative w-9 h-9 rounded-xl flex items-center justify-center border border-white/5
              {day.perfect ? 'bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.4)]' :
               day.partial ? 'bg-yellow-500/20 border-yellow-500/30' :
               day.isToday ? 'bg-zinc-800 border-yellow-500/30' :
               'bg-zinc-900'}">
              {#if day.perfect}
                <CheckCircle2 size={16} class="text-zinc-900" strokeWidth={3} />
              {:else if day.isToday && !day.perfect}
                <!-- Pulsing ring for today -->
                <div class="w-2 h-2 rounded-full bg-yellow-500/70"></div>
                <div class="absolute inset-0 rounded-xl border-2 border-yellow-500/40 animate-ping" style="animation-duration: 2s;"></div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </Card>
  </section>
</div>

<!-- ── Add / Edit Modal ────────────────────────────────────── -->
{#if showModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4" onclick={closeContextMenu}>
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick={() => showModal = false}></div>
    <div
      class="relative glass rounded-3xl p-6 w-full max-w-md border border-zinc-700/50 animate-zoom-fade-in"
      onclick={(e) => e.stopPropagation()}>

      <div class="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-5"></div>

      <div class="flex items-center justify-between mb-5">
        <h3 class="text-lg font-bold">{editingId ? 'Edit Protocol' : 'New Protocol'}</h3>
        <button onclick={() => showModal = false} class="text-zinc-500 hover:text-zinc-300 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div class="space-y-4">
        <!-- Title -->
        <div>
          <label class="text-[10px] text-zinc-500 uppercase font-bold block mb-1.5">Habit Name</label>
          <!-- svelte-ignore a11y_autofocus -->
          <input
            autofocus
            bind:value={modalTitle}
            placeholder="e.g. Read 20 Pages, Cold Shower..."
            onkeydown={(e) => e.key === 'Enter' && submitModal()}
            class="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-yellow-500/50 focus:outline-none transition-colors text-sm" />
        </div>

        <!-- Active days selector -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-[10px] text-zinc-500 uppercase font-bold">Active Days</label>
            <button
              onclick={() => { modalDays = []; haptic(HAPTIC_PATTERNS.light); }}
              class="text-[10px] text-yellow-500/70 hover:text-yellow-400 transition-colors font-medium">
              {modalDays.length === 0 ? '✓ Every Day' : 'Reset to Every Day'}
            </button>
          </div>
          <div class="flex gap-2 justify-between">
            {#each DAY_LABELS as label, i}
              {@const day = i as WeekDay}
              {@const active = modalDays.length === 0 || modalDays.includes(day)}
              <button
                onclick={() => {
                  // If currently "every day", clicking a day switches to that day only
                  if (modalDays.length === 0) {
                    modalDays = [day];
                  } else {
                    toggleModalDay(day);
                    // If all 7 selected, revert to "every day"
                    if (modalDays.length === 7) modalDays = [];
                  }
                  haptic(HAPTIC_PATTERNS.light);
                }}
                class="flex-1 h-10 rounded-xl text-xs font-bold transition-all
                  {modalDays.length === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                   modalDays.includes(day) ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                   'bg-zinc-900 text-zinc-600 border border-zinc-800 hover:border-zinc-700'}">
                {label}
              </button>
            {/each}
          </div>
          <p class="text-[10px] text-zinc-600 mt-2 text-center">
            {modalDays.length === 0 ? 'This habit will appear every day' : `Active: ${activeDayLabel(modalDays)}`}
          </p>
        </div>
      </div>

      <!-- Submit -->
      <button
        onclick={submitModal}
        class="w-full mt-5 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-[0_4px_20px_rgba(234,179,8,0.3)]">
        {editingId ? 'Save Changes' : '+ Create Protocol'}
      </button>
    </div>
  </div>
{/if}

<style>
  @keyframes slide-up {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .animate-slide-up {
    animation: slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards;
  }
</style>
