import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common'
import { Response } from 'express'

/**
 * Since we don't need any external providers here,
 * we can just bind this ExceptionFilter globally
 * using the 'app' instance in our main.ts file.
 */
@Catch(HttpException)
export class HttpExceptionFilter<T extends HttpException>
  implements ExceptionFilter
{
  catch(exception: T, host: ArgumentsHost) {
    // switchToHttp 可以访问到 inflight request (正在进行中的请求)
    const ctx = host.switchToHttp()

    // return our underlying platform's Response - Express by default
    // ? 为什么底层还会有响应，不是已经抛了异常吗
    const response = ctx.getResponse<Response>()

    // 抛出的异常
    const status = exception.getStatus()
    const exeptionResponse = exception.getResponse()

    const error =
      typeof response === 'string'
        ? { messege: exeptionResponse }
        : (exeptionResponse as object)

    response.status(status).json({
      ...error,
      timeStamp: new Date().toISOString(),
    })
  }
}
