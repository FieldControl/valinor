// NestJS
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
// Database
import { databaseConfig } from '../database/database.config';
// Controllers
import { AppController } from './app.controller';
// Modules
import { ColumnsModule } from '../features/columns/columns.module';
import { CardsModule } from '../features/cards/cards.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(databaseConfig),
    ColumnsModule,
    CardsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
