import { Module } from '@nestjs/common';
import { CoffeesModule } from 'src/coffees/coffees.module';
import { CoffeeRatingService } from './coffee-rating.service';

@Module({
  // 假设 CoffeeRatingModule 需要利用 CoffeesModule的方法 请求数据库 
  imports: [CoffeesModule],
  providers: [CoffeeRatingService]
})
export class CoffeeRatingModule {}
