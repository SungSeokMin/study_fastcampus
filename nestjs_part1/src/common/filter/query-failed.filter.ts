import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = 400;

    const offset = new Date().getTimezoneOffset() * 60000;

    let message = '데이터베이스 에러 발생';

    if (exception.message.includes('duplicate key')) {
      message = `중복 키 에러: ${exception.parameters}`;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date(Date.now() - offset),
      path: request.url,
      message,
      messageDetail: exception.detail,
    });
  }
}
