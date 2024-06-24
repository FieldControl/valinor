import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { IProject } from '../../interfaces/project.interfaces';
import { CookieService } from 'ngx-cookie-service';
import { IColumn } from '../../interfaces/column.interfaces';
import { ITask } from '../../interfaces/task.interfaces';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  clearCurrentProject() {
    throw new Error('Method not implemented.');
  }
  projectsSubject = new BehaviorSubject<IProject[]>([]);
  projects$ = this.projectsSubject.asObservable();

  projectSubject = new BehaviorSubject<IProject | null>(null);
  project$ = this.projectSubject.asObservable();

  constructor(private apollo: Apollo, private cookieService: CookieService) {
    this.loadAllProjects();
  }

  updateProjects(updatedProjects: IProject[]): void {
    this.projectsSubject.next(updatedProjects);
  }

  addProjectToSubject(project: IProject): void {
    const currentProjects = this.projectsSubject.value;
    const updatedProjects = [...currentProjects, project];
    this.projectsSubject.next(updatedProjects);
  }

  updateProjectInSubject(updatedProject: IProject): void {
    const currentProjects = [...this.projectsSubject.value];
    const projectIndex = currentProjects.findIndex(
      (p) => p.id === updatedProject.id
    );

    if (projectIndex !== -1) {
      currentProjects[projectIndex] = updatedProject;
    } else {
      currentProjects.push(updatedProject);
    }

    this.projectsSubject.next(currentProjects);
    this.projectSubject.next(updatedProject); // Atualize o projeto ativo
  }

  loadAllProjects() {
    this.getAllProjects().subscribe((projects) => {
      this.projectsSubject.next(projects);
    });
  }

  createProject(title: string, description: string, userId: string) {
    if (!userId) {
      throw new Error('Id User not found');
    }
    const userIds = [userId];

    const token = this.cookieService.get('@access_token');
    if (!token) {
      throw new Error('Token not found');
    }

    return this.apollo
      .mutate<{ createProject: IProject }>({
        mutation: gql`
          mutation CreateProject(
            $title: String!
            $description: String!
            $userIds: [String!]!
          ) {
            createProject(
              createProjectInput: {
                title: $title
                description: $description
                userIds: $userIds
              }
            ) {
              id
              title
              description
              updatedAt
              users {
                id
                name
              }
              columns {
                id
                title
                description
                order
                updatedAt
                tasks {
                  id
                  title
                  description
                  order
                  column {
                    id
                    title
                  }
                }
              }
            }
          }
        `,
        variables: {
          title,
          description,
          userIds,
        },
        context: {
          headers: {
            Authorization: `${token}`,
          },
        },
      })
      .pipe(
        map((result) => {
          const newProject = result.data?.createProject;
          if (newProject) {
            this.addProjectToSubject(newProject);
          }
          return newProject;
        })
      );
  }

  getProjectById(projectId: string): Observable<IProject> {
    return this.apollo
      .query<any>({
        query: gql`
          query GetProject($projectId: String!) {
            project(id: $projectId) {
              id
              title
              description
              updatedAt
              columns {
                id
                title
                description
                updatedAt
                order
                tasks {
                  id
                  title
                  description
                  updatedAt
                  order
                  column {
                    id
                    title
                  }
                }
              }
            }
          }
        `,
        variables: { projectId },
      })
      .pipe(
        map((result) => {
          return result.data.project as IProject;
        })
      );
  }

  getAllProjects() {
    const userId = this.cookieService.get('@userId');
    const token = this.cookieService.get('@access_token');

    if (!userId) {
      console.error('User not found');
      return of([]);
    }

    if (!token) {
      console.error('Token not found');
      return of([]);
    }

    return this.apollo
      .query<any>({
        query: gql`
          query GetUser($userId: String!) {
            user(id: $userId) {
              id
              name
              projects {
                id
                title
                description
                updatedAt
                columns {
                  id
                  title
                  description
                  updatedAt
                  order
                  tasks {
                    id
                    title
                    description
                    updatedAt
                    order
                    column {
                      id
                      title
                    }
                  }
                }
              }
            }
          }
        `,
        variables: { userId },
        context: {
          headers: {
            Authorization: `${token}`,
          },
        },
      })
      .pipe(
        map((result) => {
          const projects = result.data.user.projects;
          this.projectsSubject.next(projects);
          return projects;
        })
      );
  }

  updateProject(project: IProject): Observable<IProject | null> {
    const { id, title, description, users, columns } = project;
    const token = this.cookieService.get('@access_token');

    if (!token) {
      throw new Error('Token not found');
    }

    const userIds = users ? users.map((user) => user.id) : [];
    const columnIds = columns ? columns.map((column) => column.id) : [];

    return this.apollo
      .mutate<any>({
        mutation: gql`
          mutation UpdateProject(
            $id: String!
            $title: String!
            $description: String!
            $userIds: [String!]!
            $columnIds: [String!]!
          ) {
            updateProject(
              updateProjectInput: {
                id: $id
                title: $title
                description: $description
                userIds: $userIds
                columnIds: $columnIds
              }
            ) {
              id
              title
              description
              updatedAt
              columns {
                id
                title
                description
                updatedAt
                order
                tasks {
                  id
                  title
                  description
                  updatedAt
                  order
                  column {
                    id
                    title
                  }
                }
              }
            }
          }
        `,
        variables: {
          id,
          title,
          description,
          userIds: users ? userIds : [],
          columnIds: columns ? columnIds : [],
        },
        context: {
          headers: {
            Authorization: `${token}`,
          },
        },
      })
      .pipe(
        map((result) => {
          const updatedProject = result.data?.updateProject;
          if (updatedProject) {
            this.projectsSubject.pipe(take(1)).subscribe((currentProjects) => {
              const index = currentProjects.findIndex(
                (p) => p.id === updatedProject.id
              );
              if (index !== -1) {
                const updatedProjects = [...currentProjects];
                updatedProjects[index] = updatedProject;
                this.projectsSubject.next(updatedProjects);
                this.projectSubject.next(updatedProject);
              }
            });
          }
          return updatedProject;
        })
      );
  }

  deleteProject(projectId: string): Observable<boolean> {
    const token = this.cookieService.get('@access_token');

    if (!token) {
      throw new Error('Token not found');
    }

    return this.apollo
      .mutate<any>({
        mutation: gql`
          mutation DeleteProject($id: String!) {
            removeProject(id: $id) {
              title
              description
            }
          }
        `,
        variables: { id: projectId },
        context: {
          headers: {
            Authorization: `${token}`,
          },
        },
      })
      .pipe(
        map((result) => {
          const deletedProject = result.data.removeProject;
          if (deletedProject) {
            const currentProjects = this.projectsSubject.getValue();
            const updatedProjects = currentProjects.filter(
              (project) => project.id !== projectId
            );
            this.projectsSubject.next(updatedProjects);
            return true;
          }
          return false;
        })
      );
  }

  updateColumnsInProject(projectId: string, columns: IColumn[]) {
    this.projectsSubject.pipe(take(1)).subscribe((projects) => {
      const projectIndex = projects.findIndex(
        (project) => project.id === projectId
      );
      if (projectIndex !== -1) {
        const updatedProject = { ...projects[projectIndex], columns };
        const updatedProjects = [...projects];
        updatedProjects[projectIndex] = updatedProject;
        this.projectsSubject.next(updatedProjects);
        this.projectSubject.next(updatedProject);
      }
    });
  }

  updateProjectAfterTaskCreation(columnId: string, newTask: ITask) {
    this.projects$.pipe(take(1)).subscribe((projects) => {
      const updatedProjects = projects.map((project) => {
        const updatedColumns = project.columns?.map((column) => {
          if (column.id === columnId) {
            const updatedTasks = [...(column.tasks ?? []), newTask];
            return { ...column, tasks: updatedTasks };
          }
          return column;
        });
        return { ...project, columns: updatedColumns };
      });
      this.projectsSubject.next(updatedProjects);
      const updatedProject = updatedProjects.find((project) =>
        project.columns?.some((column) => column.id === columnId)
      );
      if (updatedProject) {
        this.projectSubject.next(updatedProject);
      }
    });
  }

  updateProjectAfterTaskDeletion(columnId: string, taskId: string) {
    this.projects$.pipe(take(1)).subscribe((projects) => {
      const updatedProjects = projects.map((project) => {
        const updatedColumns = project.columns?.map((column) => {
          if (column.id === columnId) {
            const updatedTasks = column.tasks.filter(
              (task) => task.id !== taskId
            );
            return { ...column, tasks: updatedTasks };
          }
          return column;
        });
        return { ...project, columns: updatedColumns };
      });
      this.projectsSubject.next(updatedProjects);
      const updatedProject = updatedProjects.find((project) =>
        project.columns?.some((column) => column.id === columnId)
      );
      if (updatedProject) {
        this.projectSubject.next(updatedProject);
      }
    });
  }
}
