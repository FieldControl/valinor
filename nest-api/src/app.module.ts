import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import dbConfiguration from './config/db.config';

// MODULES
import { AuthModule } from './auth/auth.module';
import { CardsModule } from './kanban/cards/cards.module';
import { ColumnsModule } from './kanban/columns/columns.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfiguration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
    }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      cors: {
        origin: true,
        methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
        credentials: true,
      },
      context: ({ req, res }) => ({ req, res }),
      playground: {
        settings: {
          'request.credentials': 'include',
        },
      },
    }),
    UserModule,
    AuthModule,
    CardsModule,
    ColumnsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
