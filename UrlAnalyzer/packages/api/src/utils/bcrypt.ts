import { compare, hash } from 'bcrypt';

export async function bcryptHash(data: string): Promise<string> {
	return hash(data, 10);
}

export async function bcryptCompare(data: string, hash: string): Promise<boolean> {
	return compare(data, hash);
}
