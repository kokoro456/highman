import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        message = Array.isArray(resp.message)
          ? resp.message.join(', ')
          : (resp.message as string) || exception.message;
        code = (resp.code as string) || `HTTP_${status}`;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      console.error('[UnhandledError]', exception.message, exception.stack);
      message = exception.message;
    }

    response.status(status).json({
      error: { code, message },
      statusCode: status,
    });
  }
}
