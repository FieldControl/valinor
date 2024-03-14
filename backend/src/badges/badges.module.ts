import { Module } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { BadgesController } from './badges.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Badge } from './entities/badge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Badge])],
  controllers: [BadgesController],
  providers: [BadgesService],
  exports: [BadgesService]
})
export class BadgesModule {}
