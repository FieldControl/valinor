import { kCache } from 'tokens.js';
import { container } from 'tsyringe';

export function createCache() {
	const cache = new Map();

	container.register(kCache, { useValue: cache });
}
