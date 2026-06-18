import { describe, expect, it } from 'vitest';
import { NAV_ITEMS, SYSTEMS_OVERVIEW_ITEMS, normalizeRoute } from './navigation';

describe('navigation config', () => {
	it('normalizes route aliases to shared active routes', () => {
		expect(normalizeRoute('/dashboard')).toBe('/');
		expect(normalizeRoute('/productivity')).toBe('/focus');
		expect(normalizeRoute('/health')).toBe('/health');
		expect(normalizeRoute('/lifeos/health', '/lifeos')).toBe('/health');
	});

	it('keeps bottom nav and systems overview routes aligned', () => {
		const navRoutes = new Set(NAV_ITEMS.map((item) => item.path));
		for (const item of SYSTEMS_OVERVIEW_ITEMS) {
			expect(navRoutes.has(item.route)).toBe(true);
		}
	});
});
