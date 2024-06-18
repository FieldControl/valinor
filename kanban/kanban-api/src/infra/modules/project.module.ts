import { Module } from '@nestjs/common';
import { ProjectService } from '../../application/services/project.service';
import { ProjectResolver } from '../../presenters/resolvers/project.resolver';
import { AuthGuard } from '@guard//auth.guard';
import { AuthModule } from './auth.module';

@Module({
  imports: [AuthModule],
  providers: [ProjectResolver, ProjectService, AuthGuard],
})
export class ProjectModule {}
