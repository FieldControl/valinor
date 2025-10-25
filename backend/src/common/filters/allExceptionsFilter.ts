import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpException,
	HttpStatus
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { LoadAPIKeyError, ToolExecutionError } from "ai";
// import { isAxiosError } from "axios";
// import { EnviromentService } from "../enviroment/enviroment.service";


interface ExceptionResponse {
	type: string;
	name?: string;
	status?: number;
	message?: string;
	code?: number | string;
	url?: string;
}

export enum ErrorCode {
	ALREADY_EXISTS = "ALREADY_EXISTS",
	NOT_FOUND = "NOT_FOUND",
	INVALID_DATA = "INVALID_DATA",
	UNAUTHORIZED = "UNAUTHORIZED",
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	// constructor() { }

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		// const request = ctx.getRequest();

		const exceptionResponse = ({
			url,
			message,
			status,
			type,
			code,
			name,
		}: ExceptionResponse) =>
			response.status(status ?? HttpStatus.INTERNAL_SERVER_ERROR).json({
				type,
				name,
				code,
				message: message ?? "Internal server error",
				statusCode: status ?? HttpStatus.INTERNAL_SERVER_ERROR,
				url,
			});


		// if (isAxiosError(exception)) {
		// 	return exceptionResponse({
		// 		type: "Axios Exception",
		// 		name: exception.name,
		// 		code: exception.code,
		// 		status: exception.response?.status,
		// 		message: exception.response?.data.error.message ?? exception.message,
		// 		url: exception.config?.url,
		// 	});
		// }

		// IsHttpException
		if (exception instanceof HttpException) {
			const errorType = "Http Exception";

			return exceptionResponse({
				type: errorType,
				name: exception.name,
				status: exception.getStatus(),
				message:
					typeof exception.getResponse() === "object"
						? exception.getResponse()["message"]
						: exception.getResponse().toString(),
			});
		}

		if (exception instanceof Prisma.PrismaClientKnownRequestError) {
			console.log(exception);

			if (exception.code === "P2002") {
				return exceptionResponse({
					type: "Prisma Unique Constraint",
					code: ErrorCode.ALREADY_EXISTS,
					message: "Registro em duplicidade.",
					status: HttpStatus.CONFLICT, // 409
				});
			}

			return exceptionResponse({
				type: exception.name,
				code: exception.code,
				message: "Internal server error",
			});
		}

		if (exception instanceof Prisma.PrismaClientValidationError) {
			console.log(exception);
			return exceptionResponse({
				type: exception.name,
				message: "Internal server error",
			});
		}

		if (exception instanceof ToolExecutionError) {
			const { message, name, toolArgs, toolName, cause } = exception;

			console.log({ name, message, toolArgs, toolName, cause });
			return exceptionResponse({
				type: "OpenAI Error",
				name: exception.name,
				message: message,
			});
		}

		if (exception instanceof LoadAPIKeyError) {
			const { message, name, cause } = exception;

			console.log({ name, message, cause });
			return exceptionResponse({
				type: "OpenAI Error",
				name: exception.name,
				message: message,
			});
		}

		console.log(exception);
		return exceptionResponse({ type: "Generic Exception" });
	}
}
