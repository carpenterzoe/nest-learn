import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto'
import { Event } from 'src/events/entities/event.entity/event.entity'
import { DataSource, Repository } from 'typeorm'
import { COFFEE_BRANDS } from './coffees.contants'
import { CreateCoffeeDto } from './dto/create-coffee.dto/create-coffee.dto'
import { UpdateCoffeeDto } from './dto/update-coffee.dto/update-coffee.dto'
import { Coffee } from './entities/coffee.entity'
import { Flavor } from './entities/flavor.entity'
// import { ConfigService, ConfigType } from '@nestjs/config'
import { ConfigType } from '@nestjs/config'
import coffeesConfig from './config/coffees.config'

/**
 * Service 处理业务逻辑的核心，与数据源交互
 */

/**
 * @Injectable decorator declaras a class that can be managed by the Nest "container".
 * This decorator marks the CoffeeService class as a "Provider".
 */

/**
 * 在NestJS中，依赖关系通常被视为单例。
 * 这意味着 一旦找到依赖项，它的值就会被缓存并在整个应用程序生命周期中重用。
 *
 * 要在NestJS中更改此行为，需要配置“@Injectable”装饰器选项的“scope”属性。
 */

// @Injectable() // marks the CoffeeService class as a "Provider".
// @Injectable({ scope: Scope.DEFAULT }) // 默认行为，单例
// @Injectable({ scope: Scope.TRANSIENT })
@Injectable() // marks the CoffeeService class as a "Provider".
export class CoffeesService {
  constructor(
    // notice!  utilize InjectRepository decorator to inject repository here
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
    private readonly dataSource: DataSource,

    // 当 provider token 不是 class 时
    @Inject(COFFEE_BRANDS) coffeeBrands: string[],
    // private readonly configService: ConfigService
    @Inject(coffeesConfig.KEY)
    private readonly coffeesConfiguration: ConfigType<typeof coffeesConfig> // ConfigType 工具类型，帮助类型推断coffeesConfig中的 key value
  ) {
    // console.log('coffeeBrands: ', coffeeBrands)

    // const databaseHost = this.configService.get<string>(
    //   'database.host'
    //   // 'localhost'  // sane default
    // )
    // console.log('databaseHost: ', databaseHost)

    // const coffeesConfig = this.configService.get('coffees')
    // console.log('coffeesConfig: ', coffeesConfig)

    console.log(coffeesConfiguration.foo)
  }

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery

    return this.coffeeRepository.find({
      // the "relation" pramameter shoule be an Array
      relations: ['flavors'],
      skip: offset,
      take: limit,
    })
  }

  async findOne(id: string) {
    const coffee = await this.coffeeRepository.findOne({
      where: { id: parseInt(id, 10) },
      relations: ['flavors'],
    })
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`)
    }
    return coffee
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const flavors = await Promise.all(
      createCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name))
    )
    // only create, not save to db
    const coffee = this.coffeeRepository.create({
      ...createCoffeeDto,
      flavors,
    })
    // utilize "save method" to save to db
    return this.coffeeRepository.save(coffee)
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    // if there's no flavors within input params, varable flavors will be "undefined".
    // "undefined" won't rewrite existing data
    const flavors =
      updateCoffeeDto.flavors &&
      (await Promise.all(
        updateCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name))
      ))
    // Q: what's the diff between fineOne & preload ?
    // A: preload 从数据库加载现有实体并替换其某些属性

    // what does "repository.update func" do ?

    // const existingCoffee = await this.findOne(id);
    // if (existingCoffee) {
    //   this.coffeeRepository.update(id, {...updateCoffeeDto, flavors})
    // }
    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
      flavors,
    })
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`)
    }
    return this.coffeeRepository.save(coffee)
  }
  async remove(id: string) {
    const coffee = await this.findOne(id)
    return this.coffeeRepository.remove(coffee)
  }

  async recommendCoffee(coffee: Coffee) {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      coffee.recommendations++
      const recommendEvent = new Event()
      recommendEvent.name = 'recommend_coffee'
      recommendEvent.type = 'coffee'
      recommendEvent.payload = { coffeeId: coffee.id }
      await queryRunner.manager.save(coffee)
      await queryRunner.manager.save(recommendEvent)
      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
    } finally {
      await queryRunner.release()
    }
  }

  async preloadFlavorByName(name: string): Promise<Flavor> {
    const existingFlavor = await this.flavorRepository.findOne({
      where: { name },
    })
    if (existingFlavor) return existingFlavor

    // notice! don't need to await response, cuz the res will be resolve by outside Promise.all

    // const newFlavor = await this.flavorRepository.create({ name })
    // return newFlavor
    return this.flavorRepository.create({ name })
  }
}
