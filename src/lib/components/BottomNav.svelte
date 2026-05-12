<script lang="ts">
  import { page } from '$app/state';
  import { base } from '$app/paths';
  import { Home, Zap, HeartPulse, Wallet, ListChecks } from 'lucide-svelte';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Focus', path: '/productivity', icon: Zap },
    { name: 'Health', path: '/health', icon: HeartPulse },
    { name: 'Finance', path: '/finance', icon: Wallet },
    { name: 'Habits', path: '/habits', icon: ListChecks }
  ];

  let activeIndex = $derived(() => {
    const idx = navItems.findIndex(item => page.url.pathname === `${base}${item.path}`);
    return idx >= 0 ? idx : 0;
  });
</script>

<nav class="fixed bottom-0 left-0 w-full glass border-t border-zinc-800 z-50 pb-[env(safe-area-inset-bottom)]">
  <!-- Sliding green indicator -->
  <div class="relative h-0.5">
    <div
      class="absolute top-0 h-0.5 w-10 bg-green-500 rounded-full nav-indicator shadow-[0_0_8px_rgba(34,197,94,0.6)]"
      style="left: calc({activeIndex()} * 20% + 10% - 20px)"
    ></div>
  </div>
  <ul class="flex justify-around items-center h-16 px-2">
    {#each navItems as item, i}
      <li class="flex-1">
        <a
          href="{base}{item.path}"
          class="flex flex-col items-center justify-center h-full space-y-1 transition-all duration-300 group"
          class:text-green-400={activeIndex() === i}
          class:text-zinc-500={activeIndex() !== i}
        >
          <div class="transition-transform duration-300 {activeIndex() === i ? 'scale-110' : 'group-hover:scale-105'}">
            <item.icon size={22} strokeWidth={activeIndex() === i ? 2.5 : 2} />
          </div>
          <span class="text-[10px] font-medium tracking-wide">{item.name}</span>
        </a>
      </li>
    {/each}
  </ul>
</nav>
