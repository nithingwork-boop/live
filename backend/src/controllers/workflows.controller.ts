import { Controller, Get, Param } from '@nestjs/common';
import { database } from '../data/db';

@Controller('/v1/workflows')
export class WorkflowsController {

  @Get()
  list() {
    const list = database.getWorkflows();
    return {
      data: list,
      total: list.length
    };
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return database.getWorkflowById(id);
  }
}

