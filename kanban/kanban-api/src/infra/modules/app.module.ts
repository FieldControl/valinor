import { AppService } from '@application/services/app.service';
import { Module } from '@nestjs/common';
import { DataModule } from './data.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

import { ThrottlerModule } from '@nestjs/throttler';

import { UserModule } from './user.module';
import { AuthModule } from './auth.module';
import { ProjectModule } from './project.module';
import { ColumnModule } from './column.module';
import { TaskModule } from './task.module';

@Module({
  imports: [
    ThrottlerModule.forRoot(),
    DataModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    AuthModule,
    UserModule,
    ProjectModule,
    ColumnModule,
    TaskModule,
  ],
  providers: [AppService],
})
export class AppModule {}
