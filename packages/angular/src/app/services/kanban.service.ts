import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Project } from '../models/kanban.model';

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  projectsData: Array<Project> = [
    {
      id: 1,
      title: 'New project',
      columns: [],
    },
  ];
  defaultProjectTitle: string = 'New Project';
  currentProject?: Array<Project> = [];

  constructor(private apiService: ApiService) {}

  createNewProject() {
    let column: [] = [];
    let project: Project = {
      id: this.projectsData.length + 1,
      title: 'New project',
      columns: column,
    };
    this.projectsData.push(project);
  }

  /*
  createNewColumn(columnName: string): void {
    const newColumn = {
      title: columnName,
      tasks: [],
    };
    this.apiService.columnsData.push(newColumn);

    createNewColumn2(id_project: number, title: string): void {
      this.projectsData.forEach((project) => {
        if(project.id == id_project) {
          project.columns.push({
            id: 1,
            id_project: project.id,
            title: title,
            tasks: [],
            excluded: false
          })
        }
      })
    }

    createNewTask(taskTitle: string, taskDescription: string): void {
      const newTask = {
        title: taskTitle,
        description: taskDescription,
      };
      this.apiService.tasksData.push(newTask);
    }

    getProject(id: number) {
      return this.projectsData.find((project) => project.id === id ? project : undefined)
  }

  setCurrentProject(id: number) {
    this.currentProject = []
    let x = this.projectsData.find((project) => project.id == id)
    if(x != undefined) {
      this.currentProject.push(x)
      console.log("Current project mudou")
    }
  }
}
*/
}
