import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { Card } from './entities/card.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColunasModule } from 'src/colunas/colunas.module';
import { UsuarioModule } from 'src/usuario/usuario.module';

@Module({
  controllers: [CardController],
  providers: [CardService],
  imports: [TypeOrmModule.forFeature([Card]), ColunasModule, UsuarioModule],
})
export class CardModule {}
