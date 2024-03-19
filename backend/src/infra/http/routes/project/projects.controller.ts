import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './projects.service';
import { Project } from '@prisma/client';
import { CurrentUser } from 'src/infra/auth/current-user-decorator';
import { UserPayload } from 'src/infra/auth/jwt.strategy';
import { JwtAuthGuard } from 'src/infra/auth/jwt-auth.guard';

interface ProjectRequest {
  title: string;
  isTemplate: string;
}

interface ProjectResponse {
  project: Project;
}

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Post()
  async createProject(
    @CurrentUser()
    { sub }: UserPayload,
    @Body()
    { title, isTemplate }: ProjectRequest,
  ): Promise<ProjectResponse> {
    const project = await this.projectService.createProject({
      title,
      isTemplate,
      userId: sub,
    });

    return { project };
  }

  @Get()
  async getAllProjects(
    @CurrentUser()
    { sub }: UserPayload,
  ) {
    const project = this.projectService.getAllProjects(sub);

    return project;
  }

  @Get(':id')
  async getProjectById(@Param('id') id: string) {
    const project = this.projectService.getProjectById(id);

    return project;
  }

  @Delete(':id')
  async deleteProject(@Param('id') id: string) {
    await this.projectService.deleteProjectById(id);
    return { message: 'Projeto deletado com sucesso!' };
  }

  @Patch(':id')
  async updateProject(
    @Param('id') id: string,
    @Body() { title }: ProjectRequest,
  ): Promise<Project> {
    const project = this.projectService.updateProjectById(id, { title });

    return project;
  }
}
