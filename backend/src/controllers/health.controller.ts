import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class HealthController {
  @Get('favicon.ico')
  favicon(@Res() res: Response) {
    res.status(204).end();
  }

  @Get()
  root() {
    return {
      name: 'Agentic FinOps Platform API',
      version: '0.1.0',
      status: 'running',
      endpoints: {
        base: '/v1',
        health: '/health',
        costs: '/v1/costs',
        anomalies: '/v1/anomalies',
        recommendations: '/v1/recommendations',
        workflows: '/v1/workflows',
        kpis: '/v1/kpis',
        audit: '/v1/audit',
        allocations: '/v1/allocations/stats'
      }
    };
  }

  @Get('/health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'FinOps API'
    };
  }

  @Get('/v1')
  apiInfo() {
    return {
      version: 'v1',
      endpoints: {
        costs: {
          method: 'GET',
          path: '/v1/costs',
          description: 'Get cost data with filtering and grouping',
          queryParams: ['granularity', 'from', 'to', 'groupBy', 'service', 'cloud']
        },
        anomalies: {
          method: 'GET',
          path: '/v1/anomalies',
          description: 'List anomalies',
          queryParams: ['status', 'severity']
        },
        recommendations: {
          method: 'GET',
          path: '/v1/recommendations',
          description: 'List optimization recommendations',
          queryParams: ['status', 'type']
        },
        workflows: {
          method: 'GET',
          path: '/v1/workflows',
          description: 'List active workflows'
        },
        kpis: {
          method: 'GET',
          path: '/v1/kpis',
          description: 'Get executive KPIs'
        },
        audit: {
          method: 'GET',
          path: '/v1/audit',
          description: 'Get audit trail',
          queryParams: ['agent', 'limit']
        },
        allocations: {
          method: 'GET',
          path: '/v1/allocations/stats',
          description: 'Get allocation statistics'
        }
      }
    };
  }
}

