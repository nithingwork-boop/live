import { Query, Resolver, Args, Field, ObjectType, ArgsType, InputType } from '@nestjs/graphql';

@ObjectType()
export class CostPoint {
  @Field(() => String)
  date!: string;
  
  @Field(() => String)
  service!: string;
  
  @Field(() => Number)
  amount!: number;
  
  @Field(() => String)
  currency!: string;
}

@ArgsType()
class CostsArgs {
  @Field(() => String, { nullable: true })
  from?: string;

  @Field(() => String, { nullable: true })
  to?: string;
}

@Resolver(() => CostPoint)
export class CostsResolver {
  @Query(() => [CostPoint])
  costs(@Args() args: CostsArgs) {
    return [
      { date: '2025-10-01', service: 'ComputeEngine', amount: 88.2, currency: 'USD' },
      { date: '2025-10-02', service: 'AzureVM', amount: 67.9, currency: 'USD' }
    ];
  }
}

