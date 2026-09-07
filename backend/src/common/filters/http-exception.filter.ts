import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const correlationId = uuidv4();
    
    let message = 'Internal server error';
    let errors = null;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        errors = (exceptionResponse as any).error || null;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      this.logger.error(`[${correlationId}] ${exception.message}`, exception.stack);
    }

    if (status >= 500) {
      // Log server errors, do not leak details
      this.logger.error(`[${correlationId}] Error processing request ${request.method} ${request.url}`, exception);
      message = 'An unexpected error occurred.';
    }

    response.status(status).json({
      success: false,
      message,
      errors: Array.isArray(message) ? message : errors ? [errors] : undefined,
      correlationId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
