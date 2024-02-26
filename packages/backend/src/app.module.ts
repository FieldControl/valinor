import { Module } from '@nestjs/common';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [ProjectsModule],
})
export class AppModule {}
