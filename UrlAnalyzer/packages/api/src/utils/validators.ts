import { HttpError } from '@structures/httpError.js';
import { REGEXES } from '../constants.js';
import { HttpStatusCode } from '../types/index.js';

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
			reason: 'A senha deve ter pelo menos 8 caracteres',
		};
	}

	if (password.length > 32) {
		return {
			valid: false,
			reason: 'A senha deve ter no máximo 32 caracteres',
		};
	}

	const regexValid = REGEXES.PASSWORD.test(password);

	return {
		valid: regexValid,
		reason: regexValid ? null : 'A senha deve ter pelo menos uma letra maiúscula, uma minúscula e um número',
	};
}

export function validateTelephone(telephone: string) {
	return REGEXES.TELEPHONE.test(telephone);
}

export function validateNumber(number: unknown): boolean {
	if (typeof number === 'number') {
		return true;
	}

	if (typeof number === 'string') {
		const parsed = Number.parseInt(number, 10);

		if (!Number.isNaN(parsed)) {
			return true;
		}
	}

	return false;
}

export function validatePagination(
	rawLimit: unknown,
	rawOffset: unknown,
	isAdmin = false,
	{ maxLimit = 150, defaultLimit = 100 } = {},
): { limit: number | null; offset: number } {
	const limit = rawLimit ? Number(rawLimit) : isAdmin ? null : defaultLimit;

	if (limit && (limit > maxLimit || limit < 1)) {
		throw new HttpError(HttpStatusCode.BadRequest, 'ValidationFailed', `Limit deve ser entre 1 e ${maxLimit}`);
	}

	const offset = rawOffset ? Number(rawOffset) : 0;

	if (offset < 0) {
		throw new HttpError(HttpStatusCode.BadRequest, 'ValidationFailed', 'Offset deve ser maior que 0');
	}

	return { limit, offset };
}

export function validateDate(date: unknown): boolean {
	if (date instanceof Date) {
		return true;
	}

	if (typeof date === 'string') {
		const parsed = Date.parse(date);

		if (!Number.isNaN(parsed)) {
			return true;
		}
	}

	return false;
}

export function validateIdParam(param: string | null | undefined, name: string): asserts param is string {
	if (!param) {
		throw new HttpError(HttpStatusCode.BadRequest, 'MissingParameters', `O parâmetro ${name} é obrigatório`);
	}

	if (!REGEXES.ID.test(param)) {
		throw new HttpError(
			HttpStatusCode.BadRequest,
			'ValidationFailed',
			`O parâmetro ${name} deve ser um Snowflake válido`,
		);
	}
}

export function validateId(id: unknown): boolean {
	if (typeof id === 'string') {
		return REGEXES.ID.test(id);
	}

	return false;
}

export function validateEnum(value: unknown, enumObject: Record<string, number | string>): boolean {
	return Object.values(enumObject).includes(value as number | string);
}

export function validateTime(value: unknown): boolean {
	if (typeof value === 'string') {
		return REGEXES.TIME.test(value);
	}

	return false;
}

export function validateWeekday(value: unknown): boolean {
	if (typeof value !== 'string') return false;

	return ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'].includes(
		value.toLocaleLowerCase().replace('-feira', ''),
	);
}

export function validatePostalCode(value: unknown): boolean {
	if (typeof value !== 'string') return false;

	return REGEXES.POSTAL_CODE.test(value);
}

export function validateCpf(value: unknown): boolean {
	if (typeof value !== 'string') return false;
	if (!REGEXES.CPF.test(value)) return false;

	const clean = value.replaceAll(/[.-]/g, '').split('');

	if (clean.join('') === '00000000000') return true;

	const verifier = clean.slice(9);

	let sum = 0;

	for (const [idx, element] of clean.entries()) {
		if (idx > 8) break;
		sum += Number(element!) * (10 - idx);
	}

	let rest = (sum * 10) % 11;
	if (rest === 10 || rest === 11) rest = 0;

	return rest === Number(verifier[0]);
}

export function validateRg(value: unknown): boolean {
	if (typeof value !== 'string') return false;

	return REGEXES.RG.test(value);
}

export function validateBoolean(value: unknown): boolean {
	if (typeof value === 'boolean') return true;
	if (typeof value === 'number') return value === 0 || value === 1;
	if (typeof value !== 'string') return false;

	return value === 'true' || value === 'false';
}
