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
let ContractsController = class ContractsController {
    list(type, status) {
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
};
__decorate([
    Get(),
    __param(0, Query('type')),
    __param(1, Query('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "list", null);
ContractsController = __decorate([
    Controller('/v1/contracts')
], ContractsController);
export { ContractsController };
