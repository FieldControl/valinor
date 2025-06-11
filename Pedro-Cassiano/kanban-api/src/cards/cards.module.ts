import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { ColumnsModule } from 'src/columns/columns.module';

@Module({
  imports: [ColumnsModule],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}