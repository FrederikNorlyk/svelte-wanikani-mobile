import { vi } from 'vitest';

vi.mock('canvas-confetti', () => ({
	default: Object.assign(vi.fn(), { reset: vi.fn() })
}));

vi.mock('$lib/functions/notifications.remote', () => ({
	registerPushNotification: vi.fn(),
	unregisterPushNotification: vi.fn()
}));

vi.mock('$lib/functions/auth.remote', () => ({ logout: vi.fn() }));
