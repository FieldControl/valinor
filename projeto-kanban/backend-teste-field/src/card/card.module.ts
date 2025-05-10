import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardResolver } from './card.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Card])],
	providers: [CardResolver, CardService],
})
export class CardModule { }
