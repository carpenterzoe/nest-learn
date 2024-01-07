import { Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';

/**
 * Service 处理业务逻辑的核心，与数据源交互
 */

// coffees.service中
@Injectable()
export class CoffeesService {
  // 模拟一个假数据源进行CRUD
  private coffees: Coffee[] = [
    {
      id: 1,
      name: 'Shipwreck Roast',
      brand: 'Buddy Brew',
      flavors: ['chocolate', 'vanilla'],
    },
  ];
  // CRUD
  findAll() {
    return this.coffees;
  }
​
  findOne(id: string) {
    // throw 'A random error'
    const coffee = this.coffees.find((item) => item.id === +id);
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`)
    }
    return coffee
  }
​
  create(createCoffeeDto: any) {
    this.coffees.push(createCoffeeDto);
  }
​
  update(id: string, updateCoffeeDto: any) {
    const existingCoffee = this.findOne(id);
    if (existingCoffee) {
      // update the existing entity
    }
  }
​
  remove(id: string) {
    const coffeeIndex = this.coffees.findIndex((item) => item.id === +id);
    if(coffeeIndex >= 0){
      this.coffees.splice(coffeeIndex, 1);
    }
  }
}