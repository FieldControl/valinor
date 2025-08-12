import { Module, Global } from '@nestjs/common';
import knex, { Knex } from 'knex';
import config from '../knexfile';

const db: Knex = knex(config);

@Global()
@Module({
  providers: [
    {
      provide: 'KNEX_CONNECTION',
      useValue: db,
    },
  ],
  exports: ['KNEX_CONNECTION'],
})
export class KnexModule {}
