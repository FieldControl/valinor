import { Module } from '@nestjs/common';
import { SwimlaneService } from './swimlane.service';
import { SwimlaneController } from './swimlane.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Swimlane } from './entities/swimlane.entity';

@Module({
  controllers: [SwimlaneController],
  providers: [SwimlaneService],
  imports: [TypeOrmModule.forFeature([Swimlane])],
})
export class SwimlaneModule { }
