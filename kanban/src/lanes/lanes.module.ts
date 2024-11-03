import { Module } from '@nestjs/common';
import { LanesService } from './lanes.service';
import { LanesController } from './lanes.controller';
import { Lane } from './entities/lane.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Lane])],
  controllers: [LanesController],
  providers: [ LanesService,],
})
export class LanesModule {}
