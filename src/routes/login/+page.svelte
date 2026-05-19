<script lang="ts">
  import { Shield, Mail, KeyRound, ArrowRight, UserPlus, Lock } from 'lucide-svelte';
  import { auth } from '$lib/auth.svelte';
  import { goto } from '$app/navigation';
  import { playMechanicalClick, playSuccessChime } from '$lib/sounds';

  let email = $state('');
  let password = $state('');
  let isRegistering = $state(false);
  let errorMsg = $state('');

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (!email.includes('@')) {
      errorMsg = 'Please enter a valid email address.';
      return;
    }
    if (password.length < 4) {
      errorMsg = 'Password must be at least 4 characters.';
      return;
    }
    
    errorMsg = '';
    playMechanicalClick();
    
    // Simulate auth request delay
    setTimeout(() => {
      auth.login(email);
      playSuccessChime();
      goto('/');
    }, 600);
  }
</script>

<div class="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100 relative overflow-hidden">
  
  <!-- Cyberpunk background accents -->
  <div class="absolute top-1/4 -left-32 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
  <div class="absolute bottom-1/4 -right-32 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl"></div>

  <div class="w-full max-w-sm z-10">
    <div class="text-center mb-10">
      <div class="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl relative">
        <div class="absolute inset-0 rounded-3xl border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.15)] animate-pulse"></div>
        <Shield size={36} class="text-teal-400" />
      </div>
      <h1 class="text-3xl font-bold tracking-tight mb-2">LifeOS</h1>
      <p class="text-zinc-500 text-sm">System Authorization Required</p>
    </div>

    <form onsubmit={handleSubmit} class="space-y-4">
      {#if errorMsg}
        <div class="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs px-4 py-3 rounded-xl mb-4 flex items-center gap-2 animate-zoom-fade-in">
          <Lock size={14} />
          {errorMsg}
        </div>
      {/if}

      <div class="relative">
        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
          <Mail size={18} />
        </div>
        <input 
          type="email" 
          bind:value={email}
          placeholder="Commander ID (Email)" 
          class="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all text-sm"
          required
        />
      </div>

      <div class="relative">
        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
          <KeyRound size={18} />
        </div>
        <input 
          type="password" 
          bind:value={password}
          placeholder="Passcode" 
          class="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all text-sm"
          required
        />
      </div>

      {#if !isRegistering}
        <div class="text-right">
          <button type="button" class="text-xs text-zinc-500 hover:text-teal-400 transition-colors font-medium">
            Forgot Passcode?
          </button>
        </div>
      {/if}

      <button 
        type="submit" 
        class="w-full bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold py-4 rounded-2xl mt-4 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(20,184,166,0.3)]">
        {isRegistering ? 'Initialize Protocol' : 'Authenticate'}
        {#if !isRegistering}
          <ArrowRight size={18} strokeWidth={2.5} />
        {/if}
      </button>
    </form>

    <div class="mt-8 text-center">
      <button 
        type="button" 
        onclick={() => { isRegistering = !isRegistering; errorMsg = ''; playMechanicalClick(); }}
        class="text-sm text-zinc-400 hover:text-zinc-200 transition-colors flex items-center justify-center gap-2 mx-auto">
        {#if isRegistering}
          Return to Login
        {:else}
          <UserPlus size={16} /> Request Access
        {/if}
      </button>
    </div>
  </div>
</div>
