var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Res } from '@nestjs/common';
let HealthController = class HealthController {
    favicon(res) {
        res.status(204).end();
    }
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
    health() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'FinOps API'
        };
    }
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
};
__decorate([
    Get('favicon.ico'),
    __param(0, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "favicon", null);
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "root", null);
__decorate([
    Get('/health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "health", null);
__decorate([
    Get('/v1'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "apiInfo", null);
HealthController = __decorate([
    Controller()
], HealthController);
export { HealthController };
