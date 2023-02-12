import { validateDate } from '@utils/validators.js';
import postgres from 'postgres';
import { container } from 'tsyringe';
import { REGEXES } from '../constants.js';
import { kSQL } from '../tokens.js';

const dateSerializer = (date: Date | string) => {
	if (!(date instanceof Date)) {
		if (REGEXES.TIME.test(date)) return date;
		if (!validateDate(date)) throw new TypeError(`Invalid date while serializing date: ${date}`);
		return new Date(date).toISOString();
	}

	return date.toISOString();
};

export function createPostgres() {
	const sql = postgres({
		types: {
			date: {
				to: 1_184,
				from: [1_082, 1_083, 1_114, 1_184],
				serialize: dateSerializer,
				parse: (isoString: string) => isoString,
			},
		},
		debug: true,
	});

	container.register(kSQL, { useValue: sql });
}
