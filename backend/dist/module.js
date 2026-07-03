var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
// GraphQL is optional - commented out to avoid schema generation issues
// Uncomment when ready to use GraphQL
// import { GraphQLModule } from '@nestjs/graphql';
// import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CostsController } from './rest.costs';
// import { CostsResolver } from './resolver.costs';
import { HealthController } from './controllers/health.controller';
import { AnomaliesController } from './controllers/anomalies.controller';
import { RecommendationsController } from './controllers/recommendations.controller';
import { WorkflowsController } from './controllers/workflows.controller';
import { KPIsController } from './controllers/kpis.controller';
import { AuditController } from './controllers/audit.controller';
import { AllocationsController } from './controllers/allocations.controller';
import { SoftwareInventoryController } from './controllers/software-inventory.controller';
import { AIController } from './controllers/ai.controller';
import { ContractsController } from './controllers/contracts.controller';
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [
        // GraphQLModule.forRoot<ApolloDriverConfig>({
        //   driver: ApolloDriver,
        //   autoSchemaFile: true,
        //   cors: {
        //     origin: true,
        //     credentials: true
        //   }
        // })
        ],
        controllers: [
            HealthController,
            CostsController,
            AnomaliesController,
            RecommendationsController,
            WorkflowsController,
            KPIsController,
            AuditController,
            AllocationsController,
            SoftwareInventoryController,
            AIController,
            ContractsController
        ],
        // providers: [CostsResolver] // Uncomment when GraphQL is enabled
    })
], AppModule);
export { AppModule };
