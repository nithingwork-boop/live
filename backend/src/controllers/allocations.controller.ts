import { Controller, Get } from '@nestjs/common';
import { database } from '../data/db';

@Controller('/v1/allocations')
export class AllocationsController {
  @Get('/stats')
  getStats() {
    return database.getAllocationStats();
  }
}
