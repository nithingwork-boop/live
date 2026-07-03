import { Controller, Get, Param, Post, Put, Query, Body } from '@nestjs/common';
import { database } from '../data/db';

@Controller('/v1/recommendations')
export class RecommendationsController {

  @Get()
  list(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('scope') scope?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const list = database.getRecommendations(scope === 'ai' ? 'ai' : 'cloud');

    let filtered = list;

    if (from) {
      const fromDate = from.slice(0, 10);
      filtered = filtered.filter((r) => (r.created_at || '').slice(0, 10) >= fromDate);
    }
    if (to) {
      const toDate = to.slice(0, 10);
      filtered = filtered.filter((r) => (r.created_at || '').slice(0, 10) <= toDate);
    }

    if (status) {
      filtered = filtered.filter((r) => r.status === status);
    }

    if (type) {
      filtered = filtered.filter((r) => r.type === type);
    }

    return {
      data: filtered,
      total: filtered.length,
    };
  }

  @Post('reset')
  reset(@Query('scope') scope?: string) {
    database.resetRecommendations(scope);
    const total = database.getRecommendations(scope === 'ai' ? 'ai' : 'cloud').length;
    return {
      message: `${scope === 'ai' ? 'AI r' : 'R'}ecommendations data has been reset to original state`,
      total,
    };
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return database.getRecommendationById(id);
  }

  @Put(':id/approve')
  approve(@Param('id') id: string, @Body() body?: { implementation_workflow?: any }) {
    return database.approveRecommendation(id, body?.implementation_workflow);
  }
}
