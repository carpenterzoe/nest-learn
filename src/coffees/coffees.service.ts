import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { Event } from 'src/events/entities/event.entity/event.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';

/**
 * Service 处理业务逻辑的核心，与数据源交互
 */
@Injectable()
export class CoffeesService {
  constructor(
    // notice!  utilize InjectRepository decorator to inject repository here
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
    private readonly dataSource: DataSource,
  ) {}

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery

    return this.coffeeRepository.find({
      // the "relation" pramameter shoule be an Array
      relations: ['flavors'],
      skip: offset,
      take: limit,
    });
  }
​
  findOne(id: string) {
    const coffee = this.coffeeRepository.findOne({ where: { id: parseInt(id, 10) }, relations: ['flavors']});
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`)
    }
    return coffee
  }
​
  async create(createCoffeeDto: CreateCoffeeDto) {
    const flavors = await Promise.all(
      createCoffeeDto.flavors.map(name => this.preloadFlavorByName(name))
    )
    // only create, not save to db
    const coffee = this.coffeeRepository.create({
      ...createCoffeeDto,
      flavors
    });
    // utilize "save method" to save to db
    return this.coffeeRepository.save(coffee);
  }
​
  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    // if there's no flavors within input params, varable flavors will be "undefined".
    // "undefined" won't rewrite existing data
    const flavors = 
      updateCoffeeDto.flavors && 
      (await Promise.all(
        updateCoffeeDto.flavors.map(name => this.preloadFlavorByName(name)
      ))
    )
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
      flavors
    })
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return this.coffeeRepository.save(coffee);
  }
​
  async remove(id: string) {
    const coffee = await this.findOne(id)
    return this.coffeeRepository.remove(coffee);
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
    const existingFlavor = await this.flavorRepository.findOne({ where: { name } })
    if (existingFlavor) return existingFlavor

    // notice! don't need to await response, cuz the res will be resolve by outside Promise.all

    // const newFlavor = await this.flavorRepository.create({ name })
    // return newFlavor
    
    return this.flavorRepository.create({ name })
  }
}