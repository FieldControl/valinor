import { Injectable } from '@nestjs/common';
import { Project } from './interfaces/projects.interface';

@Injectable()
export class ProjectsService {
  projectsArr: Project[] = [
    { id: 1, title: 'Projeto 1', columns: [] },
    { id: 2, title: 'Projeto 2', columns: [] },
    { id: 3, title: 'Projeto 3', columns: [] },
  ];

  constructor() {}

  createProject(project: Project) {
    return this.projectsArr.push(project);
  }

  getAllProjects() {
    return this.projectsArr;
  }

  getProjectById(id: number) {
    const item = this.projectsArr.find((item) => {
      return item.id == id ? item : undefined;
    });
    return item;
  }
}
