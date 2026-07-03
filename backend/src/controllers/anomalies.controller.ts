import { Controller, Get, Param, Put, Query, Body, Post } from '@nestjs/common';
import { database } from '../data/db';

@Controller('/v1/anomalies')
export class AnomaliesController {

  @Get()
  list(
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('scope') scope?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const list = database.getAnomalies(scope === 'ai' ? 'ai' : 'cloud');
    let filtered = list;

    if (from) {
      const fromDate = from.slice(0, 10);
      filtered = filtered.filter(a => (a.detected_at || '').slice(0, 10) >= fromDate);
    }
    if (to) {
      const toDate = to.slice(0, 10);
      filtered = filtered.filter(a => (a.detected_at || '').slice(0, 10) <= toDate);
    }
    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }
    if (severity) {
      filtered = filtered.filter(a => a.severity === severity);
    }

    return {
      data: filtered,
      total: filtered.length
    };
  }

  @Post('reset')
  reset(@Query('scope') scope?: string) {
    database.resetAnomalies(scope);
    const total = database.getAnomalies(scope === 'ai' ? 'ai' : 'cloud').length;
    return {
      message: `${scope === 'ai' ? 'AI a' : 'A'}nomalies data has been reset to original state`,
      total,
    };
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return database.getAnomalyById(id);
  }

  @Put(':id/resolve')
  resolve(@Param('id') id: string, @Body() body?: { resolution_type?: string }) {
    return database.resolveAnomaly(id, body?.resolution_type);
  }
}
