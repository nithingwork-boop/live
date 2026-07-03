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
import { Controller, Get, Param, Put, Query, Body, Post } from '@nestjs/common';
import { database } from '../data/db';
let AnomaliesController = class AnomaliesController {
    list(status, severity, scope, from, to) {
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
    reset(scope) {
        database.resetAnomalies(scope);
        const total = database.getAnomalies(scope === 'ai' ? 'ai' : 'cloud').length;
        return {
            message: `${scope === 'ai' ? 'AI a' : 'A'}nomalies data has been reset to original state`,
            total,
        };
    }
    get(id) {
        return database.getAnomalyById(id);
    }
    resolve(id, body) {
        return database.resolveAnomaly(id, body?.resolution_type);
    }
};
__decorate([
    Get(),
    __param(0, Query('status')),
    __param(1, Query('severity')),
    __param(2, Query('scope')),
    __param(3, Query('from')),
    __param(4, Query('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AnomaliesController.prototype, "list", null);
__decorate([
    Post('reset'),
    __param(0, Query('scope')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnomaliesController.prototype, "reset", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnomaliesController.prototype, "get", null);
__decorate([
    Put(':id/resolve'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AnomaliesController.prototype, "resolve", null);
AnomaliesController = __decorate([
    Controller('/v1/anomalies')
], AnomaliesController);
export { AnomaliesController };
