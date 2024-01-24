import { Injectable, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from 'src/events/entities/event.entity/event.entity';
import { DataSource } from 'typeorm';
import { COFFEE_BRANDS } from './coffees.contants';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';

class MockCoffeesService {}

class ConfigService {}
class DevelopmentConfigService {}
class ProductionConfigService {}

@Injectable()
export class CoffeeBrandsFactory {
  create() {
    return ['buddy brew 3', 'nescfe 3']
  }
}

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
    // CoffeeBrandsFactory,  // provider 要定义在这，useFactory 中才能使用
    {
      provide: ConfigService,
      useClass: 
        process.env.NODE_ENV === 'development'
          ? DevelopmentConfigService 
          : ProductionConfigService
    },
    // {
    //   provide: COFFEE_BRANDS,
    //   useValue: ['buddy brew', 'nescfe']
    // },
    // {
    //   provide: COFFEE_BRANDS,
    //   useFactory: (brandsFactory: CoffeeBrandsFactory) => 
    //     brandsFactory.create(),
    //   inject: [CoffeeBrandsFactory],  // "inject" takes in an Array of Providers itself.
    // },

    {
      provide: COFFEE_BRANDS,
      // 假设需要先从数据库返回一些信息，再启动程序
      // 就可以用到 useFactory Async Await 
      useFactory: async (dataSource: DataSource): Promise<string[]> => {
        // const coffeeBrands = await dataSource.query('SELECT * ...');
        const coffeeBrands = await Promise.resolve(['buddy brew 4', 'nescfe 4'])
        console.log('[!] Async factory');
        return coffeeBrands
      }
      // inject: [DataSource],  // "inject" takes in an Array of Providers itself.
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
