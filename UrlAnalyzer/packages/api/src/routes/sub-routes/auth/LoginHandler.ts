import { createSession } from '@database/session/createSession.js';
import { getUserByEmail } from '@database/users/getUser.js';
import { HttpError } from '@structures/httpError.js';
import type { POSTAuthLoginEndpointBody, POSTAuthLoginEndpointReturn } from '@types';
import { HttpStatusCode } from '@types';
import { bcryptCompare } from '@utils/bcrypt.js';
import { errorResponse, sendResponse } from '@utils/respond.js';
import { validateEmail } from '@utils/validators.js';
import type { Request, Response } from 'express';

export async function normalLoginHandler(req: Request, res: Response): Promise<void> {
	try {
		const { email, password } = req.body as POSTAuthLoginEndpointBody;

		if (!validateEmail(email)) {
			throw new HttpError(HttpStatusCode.BadRequest, 'ValidationFailed', 'Invalid email address');
		}

		if (typeof password !== 'string') {
			throw new HttpError(HttpStatusCode.BadRequest, 'ValidationFailed', 'Invalid password');
		}

		const user = await getUserByEmail(email);

		if (!user) {
			throw new HttpError(HttpStatusCode.BadRequest, 'LoginIncorrect', 'Incorrect email or password');
		}

		if (!user.password) {
			throw new HttpError(HttpStatusCode.BadRequest, 'InvalidLoginMethod', 'You used another login method to register');
		}

		const passwordMatch = await bcryptCompare(password, user.password);

		if (!passwordMatch) {
			throw new HttpError(HttpStatusCode.BadRequest, 'LoginIncorrect', 'Incorrect email or password');
		}

		const session = await createSession({ user_id: user.id });

		sendResponse<POSTAuthLoginEndpointReturn>(session, res);
	} catch (error) {
		errorResponse(HttpError.fromError(error as Error), res);
	}
}
