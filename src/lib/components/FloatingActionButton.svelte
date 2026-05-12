<script lang="ts">
  import { Plus, X, Droplets, Dumbbell, Pill } from 'lucide-svelte';
  import { page } from '$app/state';
  import { base } from '$app/paths';
  import { haptic, HAPTIC_PATTERNS } from '$lib/haptics';

  let { onClick } = $props();
  let isExpanded = $state(false);
  let isClosing = $state(false);

  let isHealthPage = $derived(page.url.pathname === `${base}/health`);

  const subItems = [
    { label: 'Water', icon: Droplets, color: 'bg-cyan-500', shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.4)]' },
    { label: 'Training', icon: Dumbbell, color: 'bg-orange-500', shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.4)]' },
    { label: 'Supplement', icon: Pill, color: 'bg-green-500', shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.4)]' }
  ];

  function handleClick() {
    if (isHealthPage) {
      haptic(HAPTIC_PATTERNS.medium);
      if (isExpanded) {
        isClosing = true;
        setTimeout(() => { isExpanded = false; isClosing = false; }, 250);
      } else {
        isExpanded = true;
      }
    } else {
      onClick?.();
    }
  }

  function handleSubClick(label: string) {
    haptic(HAPTIC_PATTERNS.snap);
    document.dispatchEvent(new CustomEvent('fab-action', { detail: { type: label.toLowerCase() } }));
    isClosing = true;
    setTimeout(() => { isExpanded = false; isClosing = false; }, 250);
  }
</script>

<div class="fixed bottom-24 right-6 z-40">
  <!-- Sub-buttons -->
  {#if isExpanded || isClosing}
    {#each subItems as item, i}
      <button
        class="absolute bottom-0 right-0 w-11 h-11 {item.color} text-white rounded-full flex items-center justify-center {item.shadow} {isClosing ? `fan-item-${i + 1}-close` : `fan-item-${i + 1}`}"
        style="opacity: 0;"
        onclick={() => handleSubClick(item.label)}
        aria-label={item.label}
      >
        <item.icon size={18} strokeWidth={2.5} />
      </button>
    {/each}
  {/if}

  <!-- Main FAB -->
  <button
    onclick={handleClick}
    class="relative w-14 h-14 bg-teal-500 hover:bg-teal-400 text-zinc-950 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all duration-300 active:scale-90"
    style="transform: rotate({isExpanded ? '45deg' : '0deg'})"
    aria-label="Add new entry"
  >
    <Plus size={28} strokeWidth={2.5} />
  </button>
</div>
