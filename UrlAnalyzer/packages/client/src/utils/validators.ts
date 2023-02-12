import { REGEXES } from '../constants';

export function validateEmail(email: string) {
	if (email.length > 255) {
		return false;
	}

	return REGEXES.EMAIL.test(email);
}

export function validatePassword(password: string): {
	reason: string | null;
	valid: boolean;
} {
	if (password.length < 8) {
		return {
			valid: false,
			reason: 'The password must be at least 8 characters long',
		};
	}

	if (password.length > 64) {
		return {
			valid: false,
			reason: 'The password must be at most 64 characters long',
		};
	}

	const regexValid = REGEXES.PASSWORD.test(password);

	return {
		valid: regexValid,
		reason: regexValid
			? null
			: 'The password must have at least one uppercase letter, one lowercase letter and one number',
	};
}
