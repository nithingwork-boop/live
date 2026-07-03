import { Controller, Get, Query } from '@nestjs/common';
import {
  generateAIHome,
  generateAIModels,
  generateAIWorkflows,
  generateAIGPU,
  generateAIBudgets,
  generateAIChargeback,
  generateAIAttribution,
  generateAIObservability,
} from '../data/ai-data';

@Controller('/v1/ai')
export class AIController {
  private defaultRange() {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    return { from, to };
  }

  @Get('/home')
  home(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('provider') provider?: string,
  ) {
    const range = this.defaultRange();
    const f = from || range.from;
    const t = to || range.to;
    return generateAIHome(f, t, provider);
  }

  @Get('/models')
  models(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('provider') provider?: string,
  ) {
    const range = this.defaultRange();
    return generateAIModels(from || range.from, to || range.to, provider);
  }

  @Get('/workflows')
  workflows(@Query('from') from?: string, @Query('to') to?: string) {
    const range = this.defaultRange();
    return generateAIWorkflows(from || range.from, to || range.to);
  }

  @Get('/gpu')
  gpu(@Query('from') from?: string, @Query('to') to?: string) {
    const range = this.defaultRange();
    return generateAIGPU(from || range.from, to || range.to);
  }

  @Get('/budgets')
  budgets(@Query('from') from?: string, @Query('to') to?: string) {
    const range = this.defaultRange();
    return generateAIBudgets(from || range.from, to || range.to);
  }

  @Get('/chargeback')
  chargeback(@Query('from') from?: string, @Query('to') to?: string) {
    const range = this.defaultRange();
    return generateAIChargeback(from || range.from, to || range.to);
  }

  @Get('/attribution')
  attribution(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('dimension') dimension?: string,
  ) {
    const range = this.defaultRange();
    const dim = (['team', 'workflow', 'model', 'provider', 'agent'].includes(dimension || '')
      ? dimension
      : 'team') as 'team' | 'workflow' | 'model' | 'provider' | 'agent';
    return generateAIAttribution(from || range.from, to || range.to, dim);
  }

  @Get('/observability')
  observability(@Query('from') from?: string, @Query('to') to?: string) {
    const range = this.defaultRange();
    return generateAIObservability(from || range.from, to || range.to);
  }
}
