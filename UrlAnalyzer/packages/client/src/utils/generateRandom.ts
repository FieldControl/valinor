export function generateRandomHash() {
	return Math.random().toString(36).slice(2, 15) + Math.random().toString(36).slice(2, 15);
}
