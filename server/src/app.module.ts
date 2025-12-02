import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

import { BoardModule } from './board/board.module.js';
import { CardModule } from './card/card.module.js';
import { ColumnsModule } from './columns/columns.module.js';

@Module({
  imports: [
    // Configuração do backend utilizando GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    BoardModule,
    CardModule,
    ColumnsModule,
  ],
})
export class AppModule {}
