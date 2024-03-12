import {
  Body,
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Query,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { Project } from 'src/interfaces/project.interface';
import { HandleMessage } from 'src/interfaces/handleMessage.interface';

@Controller('projects')
export class ProjectsController {
  constructor(private projectService: ProjectService) {}

  @Get()
  async getAllProjects(): Promise<Project[] | HandleMessage> {
    return this.projectService.getAllProjects();
  }

  @Get('query')
  async getByIdProject(
    @Query('project_id') projectId: string,
  ): Promise<Project | HandleMessage> {
    return this.projectService.getByIdProject(projectId);
  }

  @Post()
  async createProject(@Body() reqBody: Project): Promise<HandleMessage> {
    return this.projectService.createProject(reqBody);
  }

  @Put('query')
  async updateTitleProject(
    @Query('project_id') projectId: string,
    @Body() body: Project,
  ): Promise<HandleMessage> {
    return this.projectService.renameProject(projectId, body);
  }

  @Delete('query')
  async deleteProject(
    @Query('project_id') projectId: string,
  ): Promise<HandleMessage> {
    return this.projectService.deleteProject(projectId);
  }
}
