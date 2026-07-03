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

@Module({
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
export class AppModule {}
