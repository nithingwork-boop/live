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
import { Query, Resolver, Args, Field, ObjectType, ArgsType } from '@nestjs/graphql';
let CostPoint = class CostPoint {
};
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], CostPoint.prototype, "date", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], CostPoint.prototype, "service", void 0);
__decorate([
    Field(() => Number),
    __metadata("design:type", Number)
], CostPoint.prototype, "amount", void 0);
__decorate([
    Field(() => String),
    __metadata("design:type", String)
], CostPoint.prototype, "currency", void 0);
CostPoint = __decorate([
    ObjectType()
], CostPoint);
export { CostPoint };
let CostsArgs = class CostsArgs {
};
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], CostsArgs.prototype, "from", void 0);
__decorate([
    Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], CostsArgs.prototype, "to", void 0);
CostsArgs = __decorate([
    ArgsType()
], CostsArgs);
let CostsResolver = class CostsResolver {
    costs(args) {
        return [
            { date: '2025-10-01', service: 'ComputeEngine', amount: 88.2, currency: 'USD' },
            { date: '2025-10-02', service: 'AzureVM', amount: 67.9, currency: 'USD' }
        ];
    }
};
__decorate([
    Query(() => [CostPoint]),
    __param(0, Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CostsArgs]),
    __metadata("design:returntype", void 0)
], CostsResolver.prototype, "costs", null);
CostsResolver = __decorate([
    Resolver(() => CostPoint)
], CostsResolver);
export { CostsResolver };
