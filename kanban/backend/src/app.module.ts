import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ColumnResolver } from './column/column.resolver';
import { ColumnService } from './column/column.service';
import { CardResolver } from './card/card.resolver';
import { CardService } from './card/card.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver, //define o driver Apollo para GraphQL
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), //gera o schema automaticamente
      playground: true, //ativa a interface do playground GraphQL
    }),
  ],
  providers: [
    ColumnResolver, //resolutor das queries e mutations de colunas
    ColumnService, //serviço que lida com lógica de colunas
    CardResolver, //resolutor das queries e mutations de cards
    CardService, //serviço que lida com lógica de cards
  ],
})
export class AppModule {}
