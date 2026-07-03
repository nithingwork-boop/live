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
import { Controller, Get, Query } from '@nestjs/common';
import { database } from '../data/db';
import { generateAIHome } from '../data/ai-data';
let KPIsController = class KPIsController {
    get(scope, from, to) {
        const base = database.getKPIs();
        if (scope !== 'ai') {
            return base;
        }
        let filtered = database.getCosts().filter((c) => c.cloud === 'AI');
        if (from) {
            filtered = filtered.filter((c) => c.date >= from);
        }
        if (to) {
            filtered = filtered.filter((c) => c.date <= to);
        }
        const periodSpend = filtered.reduce((s, c) => s + c.cost_amount, 0);
        const f = from || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
        const t = to || new Date().toISOString().split('T')[0];
        const aiHome = generateAIHome(f, t);
        const aiRecs = database.getRecommendations('ai');
        const savingsTotal = aiRecs.reduce((s, r) => s + (r.potential_savings || 0), 0);
        const budgetTarget = periodSpend * 1.04;
        const variancePct = budgetTarget
            ? ((periodSpend - budgetTarget) / budgetTarget) * 100
            : base.budget_variance.value;
        return {
            ...base,
            scope: 'ai',
            period_spend: parseFloat(periodSpend.toFixed(2)),
            allocation_coverage: {
                ...base.allocation_coverage,
                value: 68.5,
                target: 75,
                trend: 2.4,
                status: 'on_track',
            },
            forecast_accuracy: {
                ...base.forecast_accuracy,
                value: 8.1,
                status: 'good',
            },
            waste_percentage: {
                ...base.waste_percentage,
                value: parseFloat((100 - aiHome.gpu_utilization).toFixed(1)),
                target: 25,
                status: aiHome.gpu_utilization >= 65 ? 'good' : 'warning',
            },
            savings_pipeline: {
                ...base.savings_pipeline,
                value: parseFloat(savingsTotal.toFixed(2)),
            },
            budget_variance: {
                ...base.budget_variance,
                value: parseFloat(variancePct.toFixed(1)),
            },
            tokens_processed: aiHome.tokens.total,
            cost_per_1k_tokens: aiHome.tokens.cost_per_1k,
            gpu_utilization: aiHome.gpu_utilization,
            cost_per_auow: aiHome.cost_per_auow,
        };
    }
};
__decorate([
    Get(),
    __param(0, Query('scope')),
    __param(1, Query('from')),
    __param(2, Query('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], KPIsController.prototype, "get", null);
KPIsController = __decorate([
    Controller('/v1/kpis')
], KPIsController);
export { KPIsController };
