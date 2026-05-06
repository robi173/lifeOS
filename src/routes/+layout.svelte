<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import FloatingActionButton from '$lib/components/FloatingActionButton.svelte';

	let { children } = $props();

  const handleFabClick = () => {
    // Placeholder action for quick add
    console.log("Quick add clicked");
  };
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>LifeOS</title>
</svelte:head>

<div class="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pb-20 relative">
  <!-- Main content area -->
  <main class="flex-1 w-full max-w-md mx-auto relative px-4 pt-6">
    {@render children()}
  </main>

  <FloatingActionButton onClick={handleFabClick} />
  <BottomNav />
</div>
