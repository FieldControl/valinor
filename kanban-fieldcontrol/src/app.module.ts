import { Module } from '@nestjs/common';
import { ColumnsModule } from './module/columns/columns.module';
import { CardsModule } from './module/cards/cards.module';

@Module({
  imports: [ColumnsModule, CardsModule],
  controllers: [],
  providers: [],
})

export class AppModule {}
