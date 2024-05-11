import { Module, OnModuleInit } from '@nestjs/common';
import { CardService } from './card/service/card.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CardResolver, ColumnResolver } from './resolvers';
import { ColumnService } from './card/service/column.service';
import { ColumnController } from './card/controller/column.controller';
import { CardController } from './card/controller/card.controller';

@Module({
  controllers: [ColumnController, CardController],
    providers: [CardService, ColumnService, CardResolver, ColumnResolver],
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: 'schema.gql',
    }),
  ],
  
})
export class AppModule implements OnModuleInit {
  constructor(private columnService: ColumnService) {}

  async onModuleInit() {
    await this.columnService.init();
  }
}