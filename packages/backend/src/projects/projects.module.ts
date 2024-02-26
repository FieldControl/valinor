import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { projectsProviders } from './projects.providers';
import { DatabaseModule } from '../db/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ProjectsController],
  providers: [...projectsProviders, ProjectsService],
})
export class ProjectsModule {}
