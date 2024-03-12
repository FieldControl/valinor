import { Module } from '@nestjs/common';
import { ColumnService } from './column.service';
import { ColumnController } from './column.controller';
import { DatabaseModule } from 'src/db/database.module';
import { columnProviders } from './column.providers';
import { projectsProviders } from '../project/project.providers';
import { taskProviders } from '../task/task.providers';

@Module({
  imports: [DatabaseModule],
  providers: [
    ColumnService,
    ...columnProviders,
    ...projectsProviders,
    ...taskProviders,
  ],
  controllers: [ColumnController],
})
export class ColumnModule {}
