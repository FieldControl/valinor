import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from './orm-config';
import { CardModule } from './card/card.module';
import { ColunasModule } from './colunas/colunas.module';

@Module({
  imports: [TypeOrmModule.forRoot(config), CardModule, ColunasModule],
})
export class AppModule {}
