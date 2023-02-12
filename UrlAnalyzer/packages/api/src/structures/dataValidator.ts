import { HttpStatusCode } from '../types/index.js';
import { HttpError } from './httpError.js';

type ConvertArray<T> = T extends (infer U)[] ? U : T;

interface DataOptions<T> {
	array?: boolean;
	database?: {
		table: string;
	};
	error?: string;
	optional?: boolean;
	validator(unknown: ConvertArray<T>): boolean;
}

type DataSchema<T> = {
	[key in keyof T]: DataOptions<DataSchema<T[key]>>;
};

export class DataValidator<T> {
	public schema: DataSchema<T>;

	public constructor(schema: DataSchema<T>) {
		this.schema = schema;
	}

	public validate(data: unknown, partial = false): data is T {
		if (Object.keys(data as any).length === 0) {
			throw new HttpError(HttpStatusCode.BadRequest, 'MissingParameters', 'Nenhum parametro foi enviado');
		}

		const objectKeys = Object.keys(data as any);

		if (objectKeys.length > Object.keys(this.schema).length || !objectKeys.every((key) => key in this.schema)) {
			throw new HttpError(
				HttpStatusCode.BadRequest,
				'ValidationFailed',
				'Um ou mais parametros são inválidos ou não foram reconhecidos',
			);
		}

		for (const [key, options] of Object.entries(this.schema) as unknown as [string, DataOptions<any>][]) {
			// @ts-expect-error: This is a validator function
			const dataEquivalent = data[key];

			if (!dataEquivalent && dataEquivalent !== 0) {
				if (options.optional || options.array || partial) continue;

				throw new HttpError(HttpStatusCode.BadRequest, 'MissingParameters', `O parametro ${key} é obrigatório`);
			}

			if (options.array && !Array.isArray(dataEquivalent)) {
				throw new HttpError(HttpStatusCode.BadRequest, 'ValidationFailed', `O parametro ${key} deve ser um array`);
			}

			const normalized = options.array ? dataEquivalent : [dataEquivalent];

			for (const value of normalized) {
				if (!options.validator(value)) {
					throw new HttpError(
						HttpStatusCode.BadRequest,
						'ValidationFailed',
						options.error ?? `O parametro ${key} é inválido (validador: ${options.validator.name})`,
					);
				}
			}
		}

		return true;
	}
}
