import { HttpService } from '@nestjs/axios'
import { Controller, Get, Param, Res } from '@nestjs/common'
import { lastValueFrom } from 'rxjs'

@Controller('transfer')
export class TransferController {
  constructor(private httpService: HttpService) {}

  @Get(':path(*)')
  async upload(@Res() res, @Param('path') path: string) {
    const targetBaseUrl = '' // 这里输入目标baseurl，比如 http://www.clady.cn 结尾不要带 /
    const otherUrl = targetBaseUrl + `/${path}`
    const checkResultObservable = this.httpService.get(otherUrl)
    const checkResult = (await lastValueFrom(checkResultObservable)).data
    return res.status(200).json(checkResult)
  }
}
