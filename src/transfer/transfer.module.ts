import { Module } from '@nestjs/common'
import { TransferController } from './transfer.controller'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  controllers: [TransferController],
})
export class TransferModule {}
