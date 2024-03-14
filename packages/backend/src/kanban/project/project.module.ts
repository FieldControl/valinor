import { Module } from '@nestjs/common';
import { ProjectsController } from './project.controller';
import { ProjectService } from './project.service';
import { projectsProviders } from './project.providers';
import { DatabaseModule } from '../../db/database.module';
import { columnProviders } from '../column/column.providers';
import { taskProviders } from '../task/task.providers';

@Module({
  imports: [DatabaseModule],
  providers: [
    ProjectService,
    ...projectsProviders,
    ...columnProviders,
    ...taskProviders,
  ],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
