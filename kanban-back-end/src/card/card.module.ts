import { Module } from '@nestjs/common';
import { CardResolver } from './card.resolver';
import { CardService } from './card.service';
import { ColumnModule } from '../column/column.module'; //Esta linha importa para usar o serviço de colunas

@Module({
  imports: [ColumnModule],
  providers: [CardResolver, CardService],
})
export class CardModule {}
