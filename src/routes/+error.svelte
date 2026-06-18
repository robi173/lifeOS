<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { ShieldAlert } from 'lucide-svelte';

  onMount(() => {
    const timer = setTimeout(() => {
      goto('/');
    }, 1200);
    return () => clearTimeout(timer);
  });
</script>

<div class="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-zinc-100">
  <div class="glass border border-rose-500/30 p-8 rounded-3xl max-w-sm w-full relative overflow-hidden animate-zoom-fade-in shadow-[0_0_40px_rgba(244,63,94,0.15)]">
    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-600 to-orange-500"></div>
    <div class="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
      <ShieldAlert size={32} />
    </div>
    
    <h1 class="text-2xl font-bold mb-2 tracking-tight">System Failure</h1>
    <p class="text-zinc-400 text-sm mb-6">Something went wrong while executing protocols.</p>
    
    <div class="bg-zinc-900/80 rounded-xl p-4 text-left border border-zinc-800/50 mb-6 font-mono text-xs overflow-auto max-h-32 text-rose-300">
      <p class="font-bold uppercase tracking-wider mb-1 text-rose-500/70">Error Trace</p>
      {$page.error?.message || '500 Internal Server Error'}
    </div>
    
    <button
      type="button"
      onclick={() => goto('/')}
      class="w-full inline-block bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)] active:scale-95 text-sm uppercase tracking-wider"
    >
      Reboot System
    </button>
  </div>
</div>
