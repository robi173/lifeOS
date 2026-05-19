<script lang="ts">
  let { width = 'w-full', height = 'h-full', rounded = 'rounded-2xl' } = $props();
</script>

<div class="{width} {height} {rounded} bg-zinc-900/50 border border-zinc-800/30 overflow-hidden relative">
  <div class="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-zinc-800/40 to-transparent"></div>
</div>

<style>
  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
</style>
