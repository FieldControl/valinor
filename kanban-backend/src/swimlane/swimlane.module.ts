import { Module } from '@nestjs/common';
import { SwimlaneService } from './swimlane.service';
import { SwimlaneController } from './swimlane.controller';
import { Swimlane } from './entities/swimlane.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Swimlane])],
  controllers: [SwimlaneController],
  providers: [SwimlaneService],
  exports: [SwimlaneService],
})
export class SwimlaneModule {}

