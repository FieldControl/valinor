import { Module } from '@nestjs/common';
import { ProjectsController } from './project.controller';
import { ProjectService } from './project.service';
import { projectsProviders } from './project.providers';
import { DatabaseModule } from '../../db/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ProjectsController],
  providers: [...projectsProviders, ProjectService],
})
export class ProjectsModule {}
