import { Module } from '@nestjs/common';
import { ColumnService } from './column.service';
import { ColumnController } from './column.controller';
import { DatabaseModule } from 'src/db/database.module';
import { columnProviders } from './column.providers';
import { projectsProviders } from '../project/project.providers';

@Module({
  imports: [DatabaseModule],
  providers: [ColumnService, ...columnProviders, ...projectsProviders],
  controllers: [ColumnController],
})
export class ColumnModule {}
