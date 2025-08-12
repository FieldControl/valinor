import { Module } from '@nestjs/common';

import { KnexModule } from 'src/knex.module';
import { ColumnModule } from './column/column.module';
import { CardModule } from './card/card.module';

@Module({
    imports: [KnexModule, ColumnModule, CardModule],
})
export class AppModule { }
