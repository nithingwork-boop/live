import { Controller, Get } from '@nestjs/common';
import { database } from '../data/db';

@Controller('/v1/software-inventory')
export class SoftwareInventoryController {

  @Get()
  list() {
    const list = database.getSoftwareInventory();
    return {
      data: list,
      total: list.length
    };
  }
}

