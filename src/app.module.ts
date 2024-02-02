import { Module, ValidationPipe } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CoffeesModule } from './coffees/coffees.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CoffeeRatingModule } from './coffee-rating/coffee-rating.module'
import { DatabaseModule } from './database/database.module'
import { ConfigModule } from '@nestjs/config'
import * as Joi from '@hapi/joi'
import appConfig from './config/app.config'
import { APP_PIPE } from '@nestjs/core'
import { TransferModule } from './transfer/transfer.module'
import { CommonModule } from './common/common.module'

@Module({
  imports: [
    // 顺序调换之后编译器报错！ 所以改成异步
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: +process.env.DATABASE_POST,
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    ConfigModule.forRoot({
      load: [appConfig],
      // envFilePath: '.environment', // 另外指定配置文件
      // ignoreEnvFile: true, // 忽略env(在生产环境用别的工具（比如Heroku）配置时?)
      // 用 Joi 包 校验env的配置
      validationSchema: Joi.object({
        DATABASE_HOST: Joi.required(),
        DATABASE_PORT: Joi.number().default(5432),
      }),
    }), // 未使用该模块，则获取不到 process.env ?
    CoffeesModule,
    CoffeeRatingModule,
    DatabaseModule,
    TransferModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    /**
     * Providing ValidationPipe in this manner,
     * let's Nest instantiate the ValidationPipe within the scope of the AppModule
     * and once created, register it as a Global Pipe.
     */
    {
      provide: APP_PIPE, // a special token exported from the @nestjs/core.
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
