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
import { Controller, Get, Param, Query } from '@nestjs/common';
import { database } from '../data/db';
let AuditController = class AuditController {
    list(agent, scope, limit) {
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
    get(id) {
        return database.getAuditTrailById(id);
    }
};
__decorate([
    Get(),
    __param(0, Query('agent')),
    __param(1, Query('scope')),
    __param(2, Query('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "list", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "get", null);
AuditController = __decorate([
    Controller('/v1/audit')
], AuditController);
export { AuditController };
