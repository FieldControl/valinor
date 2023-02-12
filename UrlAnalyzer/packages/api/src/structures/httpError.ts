import logger from '../logger.js';
import { HttpStatusCode, HttpErrorCodes } from '../types/index.js';

export class HttpError extends Error {
	public readonly status: number;

	public readonly code: string;

	public readonly description: string;

	public constructor(status: HttpStatusCode, code: keyof typeof HttpErrorCodes, description?: string) {
		super(`${status} ${HttpStatusCode[status]} - ${code} ${HttpErrorCodes[code]}`);

		this.status = status;
		this.message = HttpStatusCode[status]!;
		this.code = code;
		this.description = description ?? HttpErrorCodes[code];
	}

	public get json() {
		return {
			status: this.status,
			message: this.message,
			code: this.code,
			description: this.description,
		};
	}

	public static fromError(error: Error | HttpError) {
		if (error instanceof HttpError) {
			return error;
		}

		logger.error('Non-HttpError thrown: ' + error.message, error);

		return new HttpError(HttpStatusCode.InternalServerError, 'InternalError', error.message);
	}
}
