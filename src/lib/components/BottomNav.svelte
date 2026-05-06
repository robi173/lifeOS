<script lang="ts">
  import { page } from '$app/state';
  import { Home, Zap, HeartPulse, Wallet, ListChecks } from 'lucide-svelte';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Focus', path: '/productivity', icon: Zap },
    { name: 'Health', path: '/health', icon: HeartPulse },
    { name: 'Finance', path: '/finance', icon: Wallet },
    { name: 'Habits', path: '/habits', icon: ListChecks }
  ];
</script>

<nav class="fixed bottom-0 left-0 w-full glass border-t border-zinc-800 z-50 pb-[env(safe-area-inset-bottom)]">
  <ul class="flex justify-around items-center h-16 px-2">
    {#each navItems as item}
      <li class="flex-1">
        <a 
          href={item.path} 
          class="flex flex-col items-center justify-center h-full space-y-1 transition-colors duration-200"
          class:text-teal-400={page.url.pathname === item.path}
          class:text-zinc-500={page.url.pathname !== item.path}
        >
          <!-- Using item.icon directly as a component works in Svelte 5 -->
          <item.icon size={22} strokeWidth={page.url.pathname === item.path ? 2.5 : 2} />
          <span class="text-[10px] font-medium tracking-wide">{item.name}</span>
        </a>
      </li>
    {/each}
  </ul>
</nav>
