import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { Request, Response } from "express";

@Catch()
export class FilterExceptionsHttp implements ExceptionFilter{
    constructor(private adapterHost: HttpAdapterHost){}

    catch(exception: unknown, host: ArgumentsHost) {
        const {httpAdapter} = this.adapterHost;
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();
        const request = context.getRequest<Request>()
        const { status, body } = exception instanceof HttpException ?
        {
            status: exception.getStatus(),
            body: exception.getResponse(),
        }
        :   
        {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            body: {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                timestamp: new Date().toISOString(),
                path: request.url
            }
        };
        
        httpAdapter.reply(response,body,status)
    }

}