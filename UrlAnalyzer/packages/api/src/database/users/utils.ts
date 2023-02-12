import { removeUndefinedKeys } from '@utils/object.js';
import type { RawUser, SafeUser } from '../../types/index.js';

export function conditionalSafeUser(user: RawUser, condition: false): RawUser;
export function conditionalSafeUser(user: RawUser, condition?: boolean): SafeUser;
export function conditionalSafeUser(user: RawUser, condition: boolean = true): RawUser | SafeUser {
	if (condition) {
		return removeUndefinedKeys({
			...user,
			password: undefined,
			known_ips_hashes: undefined,
			reset_password_token: undefined,
		});
	}

	return user;
}
