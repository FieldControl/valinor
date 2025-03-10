import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { KanbanModule } from './kanban/kanban.module'; // Módulo Kanban
import { PrismaService } from 'prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
    }),
    KanbanModule,
    PrismaModule,
  ],
})
export class AppModule {}
