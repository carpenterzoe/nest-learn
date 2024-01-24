import { Module } from '@nestjs/common';
import { CoffeesModule } from 'src/coffees/coffees.module';
import { DatabaseModule } from 'src/database/database.module';
import { CoffeeRatingService } from './coffee-rating.service';

@Module({
  // 假设 CoffeeRatingModule 需要利用 CoffeesModule的方法 请求数据库 
  imports: [
    CoffeesModule,
    DatabaseModule.register({
      type: 'postgres',
      host: 'localhost',
      password: 'pass123',
      port: 5432
    })
  ],
  providers: [CoffeeRatingService]
})
export class CoffeeRatingModule {}
