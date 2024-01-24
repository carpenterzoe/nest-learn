import { DynamicModule, Module } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';

@Module({
  providers: [
    // static implementation of connection
    // {
    //   provide: 'CONNECTION',
    //   useValue: new DataSource({
    //     type: 'postgres',
    //     host: 'localhost',
    //     port: 5432,
    //   })
    // }
  ]
})

export class DatabaseModule {
  static register(options: DataSourceOptions): DynamicModule {
    return {
      // DynamicModule 和普通 @Module() 接收的 interface 基本相同
      // 只是需要额外传入module属性, 该属性也就是当前 module 本身
      module: DatabaseModule,
      providers: [
        {
          provide: 'CONNECTION',
          useValue: new DataSource(options)
        }
      ]
    }
  }
}
