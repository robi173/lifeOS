<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { NAV_ITEMS, normalizeRoute } from '$lib/navigation';

  const slotWidthPercent = 100 / NAV_ITEMS.length;
  const halfSlotPercent = slotWidthPercent / 2;

  let activeIndex = $derived(() => {
    const currentPath = normalizeRoute(page.url.pathname);
    const idx = NAV_ITEMS.findIndex(item => currentPath === item.path);
    return idx >= 0 ? idx : 0;
  });

  let indicatorLeft = $derived(() => `calc(${activeIndex() * slotWidthPercent}% + ${halfSlotPercent}% - 20px)`);
</script>

<nav class="fixed bottom-0 left-0 w-full glass border-t border-zinc-800 z-50 pb-[env(safe-area-inset-bottom)]">
  <!-- Sliding green indicator -->
  <div class="relative h-0.5">
    <div
      class="absolute top-0 h-0.5 w-10 bg-green-500 rounded-full nav-indicator shadow-[0_0_8px_rgba(34,197,94,0.6)]"
      style="left: {indicatorLeft()}"
    ></div>
  </div>
  <ul class="flex justify-around items-center h-16 px-2">
    {#each NAV_ITEMS as item, i}
      <li class="flex-1">
        <button
          type="button"
          onclick={() => goto(item.path)}
          class="flex flex-col items-center justify-center h-full space-y-1 transition-all duration-300 group"
          class:text-green-400={activeIndex() === i}
          class:text-zinc-500={activeIndex() !== i}
        >
          <div class="transition-transform duration-300 {activeIndex() === i ? 'scale-110' : 'group-hover:scale-105'}">
            <item.icon size={22} strokeWidth={activeIndex() === i ? 2.5 : 2} />
          </div>
          <span class="text-[10px] font-medium tracking-wide">{item.name}</span>
        </button>
      </li>
    {/each}
  </ul>
</nav>
