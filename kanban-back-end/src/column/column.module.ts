import { Module } from '@nestjs/common';
import { ColumnResolver } from './column.resolver';
import { ColumnService } from './column.service';

@Module({
  providers: [ColumnResolver, ColumnService], //Esta linha disponibiliza resolver e service
  exports: [ColumnService], //Esta linha exporta service para uso no módulo de cards
})
export class ColumnModule {}
