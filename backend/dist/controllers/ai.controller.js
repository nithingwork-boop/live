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
import { generateAIHome, generateAIModels, generateAIWorkflows, generateAIGPU, generateAIBudgets, generateAIChargeback, generateAIAttribution, generateAIObservability, } from '../data/ai-data';
let AIController = class AIController {
    defaultRange() {
        const to = new Date().toISOString().split('T')[0];
        const from = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
        return { from, to };
    }
    home(from, to, provider) {
        const range = this.defaultRange();
        const f = from || range.from;
        const t = to || range.to;
        return generateAIHome(f, t, provider);
    }
    models(from, to, provider) {
        const range = this.defaultRange();
        return generateAIModels(from || range.from, to || range.to, provider);
    }
    workflows(from, to) {
        const range = this.defaultRange();
        return generateAIWorkflows(from || range.from, to || range.to);
    }
    gpu(from, to) {
        const range = this.defaultRange();
        return generateAIGPU(from || range.from, to || range.to);
    }
    budgets(from, to) {
        const range = this.defaultRange();
        return generateAIBudgets(from || range.from, to || range.to);
    }
    chargeback(from, to) {
        const range = this.defaultRange();
        return generateAIChargeback(from || range.from, to || range.to);
    }
    attribution(from, to, dimension) {
        const range = this.defaultRange();
        const dim = (['team', 'workflow', 'model', 'provider', 'agent'].includes(dimension || '')
            ? dimension
            : 'team');
        return generateAIAttribution(from || range.from, to || range.to, dim);
    }
    observability(from, to) {
        const range = this.defaultRange();
        return generateAIObservability(from || range.from, to || range.to);
    }
};
__decorate([
    Get('/home'),
    __param(0, Query('from')),
    __param(1, Query('to')),
    __param(2, Query('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AIController.prototype, "home", null);
__decorate([
    Get('/models'),
    __param(0, Query('from')),
    __param(1, Query('to')),
    __param(2, Query('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AIController.prototype, "models", null);
__decorate([
    Get('/workflows'),
    __param(0, Query('from')),
    __param(1, Query('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AIController.prototype, "workflows", null);
__decorate([
    Get('/gpu'),
    __param(0, Query('from')),
    __param(1, Query('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AIController.prototype, "gpu", null);
__decorate([
    Get('/budgets'),
    __param(0, Query('from')),
    __param(1, Query('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AIController.prototype, "budgets", null);
__decorate([
    Get('/chargeback'),
    __param(0, Query('from')),
    __param(1, Query('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AIController.prototype, "chargeback", null);
__decorate([
    Get('/attribution'),
    __param(0, Query('from')),
    __param(1, Query('to')),
    __param(2, Query('dimension')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AIController.prototype, "attribution", null);
__decorate([
    Get('/observability'),
    __param(0, Query('from')),
    __param(1, Query('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AIController.prototype, "observability", null);
AIController = __decorate([
    Controller('/v1/ai')
], AIController);
export { AIController };
