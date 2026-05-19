import { haptic, HAPTIC_PATTERNS } from './haptics';

const AUTH_KEY = 'lifeos_auth';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

function persist(data: AuthState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data));
  }
}

function load(): AuthState {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null };
  }
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted storage
  }
  return { isAuthenticated: false, user: null };
}

export const authStore = $state<AuthState>(load());

export const auth = {
  login: (email: string, password?: string) => {
    // Simulate JWT/Token login (client-side mock for now)
    const name = email.split('@')[0];
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    
    const newState = {
      isAuthenticated: true,
      user: {
        id: 'user-' + Date.now(),
        name: capitalizedName,
        email
      }
    };
    
    authStore.isAuthenticated = newState.isAuthenticated;
    authStore.user = newState.user;
    persist(newState);
    haptic(HAPTIC_PATTERNS.success);
  },

  logout: () => {
    authStore.isAuthenticated = false;
    authStore.user = null;
    persist({ isAuthenticated: false, user: null });
    haptic(HAPTIC_PATTERNS.medium);
  }
};
