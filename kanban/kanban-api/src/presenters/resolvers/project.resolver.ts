import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ProjectService } from '../../application/services/project.service';
import { Project } from '../../domain/entities/project.entity';
import { CreateProjectInput } from '../../application/dto/projectDto/create-project.input';
import { UpdateProjectInput } from '../../application/dto/projectDto/update-project.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@guard//auth.guard';
import { Throttle } from '@nestjs/throttler';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @Mutation(() => Project)
  @UseGuards(AuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  createProject(
    @Args('createProjectInput') createProjectInput: CreateProjectInput,
  ) {
    return this.projectService.create(createProjectInput);
  }

  @Query(() => [Project], { name: 'projects' })
  findAll() {
    return this.projectService.findAll();
  }

  @Query(() => Project, { name: 'project' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.projectService.findOne(id);
  }

  @Mutation(() => Project)
  @UseGuards(AuthGuard)
  updateProject(
    @Args('updateProjectInput') updateProjectInput: UpdateProjectInput,
  ) {
    return this.projectService.update(
      updateProjectInput.id,
      updateProjectInput,
    );
  }

  @Mutation(() => Project)
  @UseGuards(AuthGuard)
  removeProject(@Args('id', { type: () => String }) id: string) {
    return this.projectService.remove(id);
  }
}
