import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ValidationPipe } from '@nestjs/common'
import { HttpExceptionFilter } from './common/filter/http-exception/http-exception.filter'
import { WrapResponseInterceptor } from './common/interceptors/wrap-response/wrap-response.interceptor'
// import { ApiKeyGuard } from './common/guards/api-key/api-key.guard'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.useStaticAssets('public', { prefix: '/static' })
  app.useGlobalPipes(
    // 无法在这里注入任何依赖，因为这里处于其他 NestJS Module 的上下文之外
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  )
  app.useGlobalFilters(new HttpExceptionFilter())
  // app.useGlobalGuards(new ApiKeyGuard()) // 在Common Module中注入了，因为 ApiKeyGuard 内部有其他依赖
  app.useGlobalInterceptors(new WrapResponseInterceptor())
  app.enableCors()
  await app.listen(3000)
}
bootstrap()
