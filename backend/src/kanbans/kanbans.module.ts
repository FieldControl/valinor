import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanbansService } from './kanbans.service';
import { KanbansController } from './kanbans.controller';
import { Kanban } from './entities/kanban.entity';
import { Card } from '../cards/entities/card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Kanban, Card])],
  controllers: [KanbansController],
  providers: [KanbansService],
})
export class KanbansModule {}
