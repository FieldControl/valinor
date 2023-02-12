import process from 'node:process';

export function resolveEnv(key: string): string {
	if (!Reflect.has(process.env, key)) {
		throw new Error(`Missing environment variable: ${key}`);
	}

	return process.env[key]!;
}
