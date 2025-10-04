import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from '../database/database.config';
import { ColumnsModule } from '../columns/columns.module';
import { CardsModule } from '../cards/cards.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(databaseConfig),
    ColumnsModule,
    CardsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
