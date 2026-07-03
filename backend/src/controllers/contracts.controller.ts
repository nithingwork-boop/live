import { Controller, Get, Query } from '@nestjs/common';
import { database } from '../data/db';

@Controller('/v1/contracts')
export class ContractsController {

  @Get()
  list(
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    const payload = database.getContractsPayload();
    let contracts = [...payload.contracts];
    let optimizations = [...payload.optimizations];

    if (type && type !== 'all') {
      contracts = contracts.filter((c) => c.contract_type === type);
      optimizations = optimizations.filter((o) => o.contract_type === type);
    }

    if (status) {
      contracts = contracts.filter((c) => c.status === status);
      optimizations = optimizations.filter((o) => o.status === status);
    }

    return {
      contracts,
      optimizations,
      summary: payload.summary,
      total: contracts.length,
    };
  }
}
