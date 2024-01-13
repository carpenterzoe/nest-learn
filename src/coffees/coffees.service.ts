import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) {}

  findAll() {
    // the "relation" pramameter shoule be an Array
    return this.coffeeRepository.find({relations: ['flavors']});
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
    const existingCoffee = await this.findOne(id);
    if (existingCoffee) {
      // update the existing entity
    }
  }
​
  async remove(id: string) {
    const coffee = await this.findOne(id)
    return this.coffeeRepository.remove(coffee);
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