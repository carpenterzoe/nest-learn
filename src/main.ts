import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ValidationPipe } from '@nestjs/common'

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
  await app.listen(3000)
}
bootstrap()
