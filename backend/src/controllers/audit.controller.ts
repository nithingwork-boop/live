import { Controller, Get, Param, Query } from '@nestjs/common';
import { database } from '../data/db';

@Controller('/v1/audit')
export class AuditController {

  @Get()
  list(
    @Query('agent') agent?: string,
    @Query('scope') scope?: string,
    @Query('limit') limit?: string,
  ) {
    const list = database.getAuditTrail();
    let filtered = [...list];

    if (agent) {
      filtered = filtered.filter((a) => a.agent.toLowerCase().includes(agent.toLowerCase()));
    }

    if (scope && scope !== 'all') {
      filtered = filtered.filter((a) => a.scope === scope);
    }

    const limitNum = limit ? parseInt(limit, 10) : 50;
    filtered = filtered.slice(0, limitNum);

    return {
      data: filtered,
      total: list.length,
    };
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return database.getAuditTrailById(id);
  }
}
