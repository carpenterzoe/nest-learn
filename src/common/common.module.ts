import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ApiKeyGuard } from './guards/api-key/api-key.guard'
import { ConfigModule } from '@nestjs/config'
import { LoggingMiddleware } from './middleware/logging/logging.middleware'

// a module class where we can register any global enhancers we might take in the future.
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(LoggingMiddleware).forRoutes('*')
    consumer.apply(LoggingMiddleware).forRoutes({
      path: 'coffees/*',
      method: RequestMethod.GET,
    })
  }
}
