import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { KanbanModule } from './kanban/kanban.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Configurações do TypeORM com dados do banco de dados
    // usando o ConfigService para pegar as variáveis de ambiente
    // e o TypeOrmModule para conectar ao banco de dados
    // e carregar as entidades automaticamente.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: parseInt(config.get('DB_PORT') || '5432'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    // Configuração do GraphQL com o ApolloDriver
    // GraphQLModule para configurar o GraphQL
    // e gerar o schema automaticamente.
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
    }),

    // Importando o módulo KanbanModule que contém
    // a lógica de negócios e as entidades do Kanban
    // e o resolver GraphQL para o Kanban.
    // O KanbanModule é responsável por gerenciar as colunas e cards do Kanban.
    // Ele importa o TypeOrmModule para usar o TypeORM com o NestJS,
    // KanbanService para lógica de negócios,
    // ColumnEntity e CardEntity para as entidades do banco de dados,
    // e KanbanResolver para resolver as queries e mutations GraphQL.
    KanbanModule,
  ],
})
export class AppModule {}
