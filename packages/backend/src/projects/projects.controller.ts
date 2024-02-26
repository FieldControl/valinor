import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './interfaces/projects.interface';

@Controller('projects')
export class ProjectsController {
  constructor(private projectService: ProjectsService) {}

  @Get()
  async getAll(): Promise<Project[]> {
    return this.projectService.getAllProjects();
  }

  @Get('get')
  async getId(@Query('id') id: number): Promise<Project> {
    return this.projectService.getProjectById(id);
  }

  @Post()
  async create(@Body() body: Project): Promise<any> {
    return this.projectService.createProject(body);
  }
}
