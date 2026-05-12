<script lang="ts">
  import { haptic, HAPTIC_PATTERNS } from '$lib/haptics';

  let { progress = 0, color = 'teal', height = 'h-2', class: className = '' } = $props();

  let isDragging = $state(false);
  let dragProgress = $state(0);
  let barRef: HTMLDivElement;

  let colorClass = $derived(() => {
    if (color === 'green') return 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
    if (color === 'yellow') return 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]';
    if (color === 'orange') return 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]';
    if (color === 'rose') return 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]';
    return 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]'; // default teal
  });

  const handlePointerDown = (e: PointerEvent) => {
    isDragging = true;
    updateDrag(e);
    haptic(HAPTIC_PATTERNS.light);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    updateDrag(e);
  };

  const handlePointerUp = () => {
    if (isDragging) {
      isDragging = false;
      haptic(HAPTIC_PATTERNS.snap);
    }
  };

  const updateDrag = (e: PointerEvent) => {
    if (!barRef) return;
    const rect = barRef.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    dragProgress = (x / rect.width) * 100;
  };

  let displayProgress = $derived(isDragging ? dragProgress : progress);
</script>

<svelte:window onpointerup={handlePointerUp} onpointermove={handlePointerMove} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  bind:this={barRef}
  onpointerdown={handlePointerDown}
  class="w-full bg-zinc-800 rounded-full overflow-hidden {height} {className} cursor-ew-resize relative group"
>
  <div 
    class="h-full rounded-full {isDragging ? 'transition-none' : 'transition-[width] duration-700'} {colorClass()}" 
    style="width: {displayProgress}%; {isDragging ? '' : 'transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);'}"
  ></div>
  <div class="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity pointer-events-none rounded-full"></div>
</div>
