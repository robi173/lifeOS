<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import FloatingActionButton from '$lib/components/FloatingActionButton.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();
	let currentTime = $state(new Date());

	onMount(() => {
		const timer = setInterval(() => {
			currentTime = new Date();
		}, 1000);

		const handleFabAction = (e: any) => {
			// Handle actions from FloatingActionButton sub-buttons
			console.log("FAB Action:", e.detail.type);
		};

		document.addEventListener('fab-action', handleFabAction);

		return () => {
			clearInterval(timer);
			document.removeEventListener('fab-action', handleFabAction);
		};
	});

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
	
	<!-- System Clock / Status Bar -->
	<div class="fixed bottom-18 right-4 z-30 pointer-events-none">
		<div class="flex items-center gap-2 bg-zinc-900/40 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800/50">
			<div class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
			<span class="text-[10px] font-mono text-zinc-400">
				{new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(currentTime)}
			</span>
		</div>
	</div>

	<BottomNav />
</div>
