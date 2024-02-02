import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ApiKeyGuard } from './guards/api-key/api-key.guard'
import { ConfigModule } from '@nestjs/config'

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
export class CommonModule {}
