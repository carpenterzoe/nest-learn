import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from 'src/events/entities/event.entity/event.entity';
import { COFFEE_BRANDS } from './coffees.contants';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';

class MockCoffeesService {}

@Module({
  imports: [TypeOrmModule.forFeature([Coffee, Flavor, Event])],
  controllers: [CoffeesController],

  // 在 CoffeesModule 中，向 Nest loC(控制反转) 容器注册 providers.
  // providers: [CoffeesService],

  // providers: [
  //   {
  //     provide: CoffeesService,  // token 
  //     useValue: new MockCoffeesService()  // value
  //   },
  // ],
  providers: [
    CoffeesService,
    {
      provide: COFFEE_BRANDS,
      useValue: ['buddy brew', 'nescfe']
    },
  ],

  /**
   * If we want to use the CoffeesService in another module,
   * we MUST explicitly define it as "exported".
   * 
   * 必须显式导出，其他模块才能用
   */
  exports: [CoffeesService],
})
export class CoffeesModule {}
