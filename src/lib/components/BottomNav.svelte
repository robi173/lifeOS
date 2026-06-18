<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { base } from '$app/paths';
  import { Home, Zap, HeartPulse, Wallet, ListChecks } from 'lucide-svelte';
  import { NAV_ITEMS, normalizeRoute } from '$lib/navigation';

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    icon:
      item.key === 'dashboard'
        ? Home
        : item.key === 'focus'
          ? Zap
          : item.key === 'health'
            ? HeartPulse
            : item.key === 'finance'
              ? Wallet
              : ListChecks
  }));

  const stripBase = (pathname: string) => {
    if (!base || base === '/') return pathname;
    if (pathname.startsWith(base)) {
      const stripped = pathname.slice(base.length);
      return stripped || '/';
    }
    return pathname;
  };

  let activePath = $derived.by(() => normalizeRoute(stripBase(page.url.pathname)));

  let activeIndex = $derived.by(() => {
    const idx = navItems.findIndex(item => item.path === activePath);
    return idx >= 0 ? idx : 0;
  });
</script>

<nav class="fixed bottom-0 left-0 w-full glass border-t border-zinc-800 z-50 pb-[env(safe-area-inset-bottom)]">
  <!-- Sliding green indicator -->
  <div class="relative h-0.5">
    <div
      class="absolute top-0 h-0.5 w-10 bg-green-500 rounded-full nav-indicator shadow-[0_0_8px_rgba(34,197,94,0.6)]"
      style="left: calc({activeIndex} * 20% + 10% - 20px)"
    ></div>
  </div>
  <ul class="flex justify-around items-center h-16 px-2">
    {#each navItems as item, i}
      <li class="flex-1">
        <button
          type="button"
          onclick={() => goto(item.path)}
          class="w-full flex flex-col items-center justify-center h-full space-y-1 transition-all duration-300 group rounded-xl mx-1 {activeIndex === i ? 'bg-green-500/10 text-green-400' : 'text-zinc-500'}"
          aria-current={activeIndex === i ? 'page' : undefined}
        >
          <div class="transition-transform duration-300 {activeIndex === i ? 'scale-110' : 'group-hover:scale-105'}">
            <item.icon size={22} strokeWidth={activeIndex === i ? 2.5 : 2} />
          </div>
          <span class="text-[10px] font-medium tracking-wide">{item.name}</span>
        </button>
      </li>
    {/each}
  </ul>
</nav>
