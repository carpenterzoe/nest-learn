import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto'
import { CoffeesService } from './coffees.service'
import { CreateCoffeeDto } from './dto/create-coffee.dto/create-coffee.dto'
import { UpdateCoffeeDto } from './dto/update-coffee.dto/update-coffee.dto'
import { Public } from 'src/common/decorators/public.decorator'
import { ParseIntPipe } from 'src/common/pipes/parse-int/parse-int.pipe'
import { Protocol } from 'src/common/decorators/protocol.decorator'

// new 实例的话，优点是 可以自己传配置， 缺点是 无法共用全局同一个实例，所以尽量用class以减少内存使用
// @UsePipes(new ValidationPipe(options))

// @UsePipes(new ValidationPipe()) // 如果针对特定场景需要自定义配置，则可以自己实例化；但尽可能不要用这种方式(非全局的单例，Nest无法重用该实例，占内存)
@UsePipes(ValidationPipe)
@Controller('coffees')
export class CoffeesController {
  // keyword readonly ensure we aren't modifying the service referenced,
  // only accessing things from it.

  /**
   * we can see we are requesting the CoffeeService in our constructor.
   *
   * This request tells Nest to "inject" the provider into our controller class
   * so that we may be able to utilize it.
   */
  constructor(private readonly coffeeService: CoffeesService) {
    // nest会自动创建并返回 CoffeesService 实例，供 controller 调用
    /**
     * 为什么在构造函数中这样写，就能把CoffeeServie注入？
     *
     * 3 key steps:
     *
     * 1. in our CoffeeService, @Injectable decorator declaras a class
     * that can be managed by the Nest "container".
     * This decorator marks the CoffeeService class as a "Provider".
     *
     * 2. request the CoffeeService in our constructor.
     * This request tells Nest to "inject" the provider into our controller class.
     *
     * 3. In CoffeesModule, registers this Providers.
     * 在 CoffeesModule 中，向 Nest loC(控制反转) 容器注册 providers.
     */
  }

  // @SetMetadata('isPublic', true) // 将 SetMetadata 包装到自定义的装饰器中，避免每次都要传 key value
  @Public()
  @UsePipes(ValidationPipe) // @UsePipes() 作用于单个路由
  @Get()
  findAll(
    @Protocol('https') protocol: string,
    @Query() paginationQuery: PaginationQueryDto
  ) {
    console.log({ protocol })
    // await new Promise((resolve) => setTimeout(resolve, 5000))
    return this.coffeeService.findAll(paginationQuery)
  }

  // ! BAD CASE
  /**
   * 不要在响应里面用express之类的框架语法，尽量要用nest标准方法
   * 否则就用不了nest提供的 拦截器 HttpCode 装饰器等
   * 而且不同的底层框架，返回不同格式的响应对象
   * 也会使项目更难测试，测试的时候需要考虑该框架的返回格式，单独测试
   */
  // @Get()
  // findAll(@Res() response) {
  //   response.status(200).send('all coffees')
  // }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    console.log('id: ', id)
    // return `I want no.${id} coffee.`
    return this.coffeeService.findOne(id)
  }

  @Post()
  create(@Body() CreateCoffeeDto: CreateCoffeeDto) {
    // return body
    return this.coffeeService.create(CreateCoffeeDto)
  }

  @Patch(':id')
  update(
    // what if we want to bind a Pipe to the 'body' but not the 'id' parameter ?
    @Param('id') id: string,
    @Body(ValidationPipe) UpdateCoffeeDto: UpdateCoffeeDto
  ) {
    // return `update #${id} coffee`
    return this.coffeeService.update(id, UpdateCoffeeDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // return `remove #${id} coffee`
    return this.coffeeService.remove(id)
  }
}
