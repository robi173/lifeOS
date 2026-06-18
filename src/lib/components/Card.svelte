<script lang="ts">
  let { children, class: className = '', glowColor = '', onclick = undefined } = $props();

  // Helper to add neon glow if specified
  let glowClasses = $derived(() => {
    if (glowColor === 'teal') return 'shadow-[0_0_15px_rgba(20,184,166,0.15)] border-teal-500/20';
    if (glowColor === 'green') return 'shadow-[0_0_15px_rgba(34,197,94,0.15)] border-green-500/20';
    if (glowColor === 'yellow') return 'shadow-[0_0_15px_rgba(234,179,8,0.15)] border-yellow-500/20';
    return '';
  });
</script>

<div class="glass rounded-2xl p-5 hover-float {glowClasses()} {className}" {onclick}>
  {@render children()}
</div>
