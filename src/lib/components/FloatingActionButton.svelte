<script lang="ts">
  import { Plus } from 'lucide-svelte';
  
  let { onClick } = $props();
</script>

<button 
  onclick={onClick}
  class="fixed bottom-24 right-6 w-14 h-14 bg-teal-500 hover:bg-teal-400 text-zinc-950 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-transform hover:scale-105 active:scale-95 z-40"
  aria-label="Add new entry"
>
  <Plus size={28} strokeWidth={2.5} />
</button>
