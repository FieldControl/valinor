import { DataValidator } from '@structures/dataValidator.js';
import type { ModifiableUser } from '@types';
import { validateBoolean, validateEmail, validateEnum } from '@utils/validators.js';
import { UserType } from 'types/enums.js';

export const UserSchema = new DataValidator<ModifiableUser>({
	active: {
		validator: validateBoolean,
		optional: true,
		error: 'Invalid active value',
	},
	email: {
		validator: validateEmail,
		error: 'Invalid email',
	},
	name: {
		validator: (name) => typeof name === 'string' && name.length > 0,
		error: 'Invalid name',
	},
	password: {
		validator: (password) => typeof password === 'string' && password.length > 0,
		error: 'Invalid password',
	},
	known_ips_hashes: {
		validator: (ip) => typeof ip === 'string',
		error: 'Invalid known_ips_hashes',
	},
	type: {
		validator: (type) => validateEnum(type, UserType),
		error: 'Invalid type value',
		optional: true,
	},
});
