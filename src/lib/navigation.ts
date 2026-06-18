export type NavKey = 'dashboard' | 'focus' | 'health' | 'finance' | 'habits';

export interface NavItem {
  key: NavKey;
  name: string;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', name: 'Dashboard', path: '/' },
  { key: 'focus', name: 'Focus', path: '/focus' },
  { key: 'health', name: 'Health', path: '/health' },
  { key: 'finance', name: 'Finance', path: '/finance' },
  { key: 'habits', name: 'Habits', path: '/habits' }
];

const ROUTE_ALIASES: Record<string, string> = {
  '/dashboard': '/',
  '/productivity': '/focus'
};

export function normalizeRoute(pathname: string): string {
  if (!pathname) return '/';

  const trimmed = pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;

  return ROUTE_ALIASES[trimmed] ?? trimmed;
}
