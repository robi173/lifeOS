export type NavKey = 'dashboard' | 'focus' | 'health' | 'finance' | 'habits';

export interface NavItem {
  key: NavKey;
  label: string;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/' },
  { key: 'focus', label: 'Focus', path: '/focus' },
  { key: 'health', label: 'Health', path: '/health' },
  { key: 'finance', label: 'Finance', path: '/finance' },
  { key: 'habits', label: 'Habits', path: '/habits' }
];

const ROUTE_ALIASES: Record<string, string> = {
  '/dashboard': '/',
  '/productivity': '/focus'
};

export function normalizeRoute(pathname: string): string {
  if (!pathname) return '/';

  const cleaned = pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;

  return ROUTE_ALIASES[cleaned] ?? cleaned;
}
