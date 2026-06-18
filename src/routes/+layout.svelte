<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import FloatingActionButton from '$lib/components/FloatingActionButton.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { authStore, auth } from '$lib/auth.svelte';
	import { habitsStore } from '$lib/habits.svelte';
	import { fade } from 'svelte/transition';
	import { ChevronLeft, Settings, User, LogOut } from 'lucide-svelte';

	let { children } = $props();
	let currentTime = $state(new Date());
	let showSettings = $state(false);
	
	let isLoginPage = $derived(page.url?.pathname === '/login');
	let isDashboard = $derived(page.url?.pathname === '/');
	let showBackButton = $derived(!isLoginPage && !isDashboard);

	$effect(() => {
		// Run auth guard on the client
		if (!authStore.isAuthenticated && !isLoginPage) {
			goto('/login');
		} else if (authStore.isAuthenticated && isLoginPage) {
			goto('/');
		}
	});

	onMount(() => {
		habitsStore.checkDayChange();
		const timer = setInterval(() => {
			currentTime = new Date();
		}, 1000);
		const dayTimer = setInterval(() => {
			habitsStore.checkDayChange();
		}, 60_000);

		const handleFabAction = (e: any) => {
			// Handle actions from FloatingActionButton sub-buttons
			console.log("FAB Action:", e.detail.type);
		};

		document.addEventListener('fab-action', handleFabAction);

		return () => {
			clearInterval(timer);
			clearInterval(dayTimer);
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

<div class="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-x-hidden {isLoginPage ? '' : 'pb-20'}">
	{#if !isLoginPage}
		<!-- Settings & Profile Dropdown -->
		<div class="fixed top-6 right-6 z-50">
			<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
			<div 
				class="w-12 h-12 bg-purple-500/10 backdrop-blur-md border border-purple-500/30 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-500/20 hover:border-purple-500/50 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-95 text-purple-400"
				onclick={() => showSettings = !showSettings}
			>
				<Settings size={22} class={showSettings ? 'animate-[spin_4s_linear_infinite]' : ''} />
			</div>

			{#if showSettings}
				<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
				<div 
					class="fixed inset-0 z-40" 
					onclick={() => showSettings = false}
				></div>
				
				<div 
					class="absolute top-16 right-0 z-50 w-64 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-3xl p-4 shadow-2xl origin-top-right transition-all" 
					in:fade={{duration: 150}} 
					out:fade={{duration: 150}}
				>
					<div class="flex items-center gap-3 mb-4 border-b border-zinc-800/50 pb-4">
						<div class="w-12 h-12 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full flex items-center justify-center shrink-0">
							<User size={20} />
						</div>
						<div class="overflow-hidden">
							<p class="font-bold text-sm truncate text-zinc-100">{authStore.user?.name || 'Commander'}</p>
							<p class="text-xs text-zinc-500 truncate">{authStore.user?.email || 'Unknown ID'}</p>
						</div>
					</div>
					
					<button 
						onclick={() => { showSettings = false; auth.logout(); goto('/login'); }} 
						class="w-full flex items-center gap-3 text-rose-400 hover:bg-rose-500/10 p-3 rounded-2xl transition-colors text-sm font-bold active:scale-95"
					>
						<LogOut size={18} />
						Terminate Session
					</button>
				</div>
			{/if}
		</div>
	{/if}

	{#if showBackButton}
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div 
			class="fixed top-6 left-6 z-50 w-12 h-12 bg-teal-500/10 backdrop-blur-md border border-teal-500/30 rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-500/20 hover:border-teal-500/50 transition-all shadow-[0_0_15px_rgba(20,184,166,0.2)] hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] active:scale-95 text-teal-400"
			onclick={() => goto('/')}
			in:fade={{ duration: 200 }}
			out:fade={{ duration: 200 }}
		>
			<ChevronLeft size={24} />
		</div>
	{/if}

	<!-- Main content area -->
	<main class="flex-1 w-full max-w-md mx-auto relative px-4 pt-6 flex flex-col">
		{#key page.url?.pathname}
			<div in:fade={{ duration: 250, delay: 100 }} out:fade={{ duration: 200 }} class="flex-1 flex flex-col">
				{@render children()}
			</div>
		{/key}
	</main>

	{#if !isLoginPage}
		<FloatingActionButton onClick={handleFabClick} />
		
		<!-- System Clock / Status Bar -->
		<div class="fixed bottom-18 right-4 z-30 pointer-events-none" in:fade>
			<div class="flex items-center gap-2 bg-zinc-900/40 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800/50">
				<div class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
				<div class="flex flex-col leading-tight">
					<span class="text-[10px] font-mono text-zinc-400">
						{new Intl.DateTimeFormat('de-AT', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(currentTime)}
					</span>
					<span class="text-[9px] font-mono text-zinc-500">
						{new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(currentTime)}
					</span>
				</div>
			</div>
		</div>

		<BottomNav />
	{/if}
</div>
