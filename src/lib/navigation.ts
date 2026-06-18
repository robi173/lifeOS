import { Home, Zap, HeartPulse, Wallet, ListChecks } from 'lucide-svelte';

export const NAV_ITEMS = [
	{ name: 'Dashboard', path: '/', icon: Home },
	{ name: 'Focus', path: '/focus', icon: Zap },
	{ name: 'Health', path: '/health', icon: HeartPulse },
	{ name: 'Finance', path: '/finance', icon: Wallet },
	{ name: 'Habits', path: '/habits', icon: ListChecks }
] as const;

export const SYSTEMS_OVERVIEW_ITEMS = [
	{ label: 'Focus', stat: 'productivity', color: 'text-teal-400', bg: 'bg-teal-500/10', icon: Zap, route: '/focus' },
	{ label: 'Health', stat: 'health', color: 'text-rose-400', bg: 'bg-rose-500/10', icon: HeartPulse, route: '/health' },
	{ label: 'Finance', stat: 'finance', color: 'text-green-400', bg: 'bg-green-500/10', icon: Wallet, route: '/finance' },
	{ label: 'Habits', stat: 'habits', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: ListChecks, route: '/habits' }
] as const;

const ROUTE_ALIASES: Record<string, string> = {
	'/dashboard': '/',
	'/productivity': '/focus'
};

export function normalizeRoute(pathname: string, base = ''): string {
	const withoutBase = base && pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname;
	const normalizedPath = withoutBase.startsWith('/') ? withoutBase : `/${withoutBase}`;

	if (ROUTE_ALIASES[normalizedPath]) return ROUTE_ALIASES[normalizedPath];
	if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) return normalizedPath.slice(0, -1);
	return normalizedPath;
}
