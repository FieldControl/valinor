import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IProject } from '../../interfaces/project.interfaces';
import { ProjectService } from '../../services/projects/project.service';
import { CommonModule } from '@angular/common';
import { ColumnListComponent } from '../../components/column-list/column-list.component';
import { ColumnService } from '../../services/columns/column.service';
import { Subscription, map } from 'rxjs';

@Component({
  selector: 'app-render-project',
  standalone: true,
  imports: [CommonModule, ColumnListComponent],
  templateUrl: './render-project.component.html',
  styleUrls: ['./render-project.component.scss'],
})
export class RenderProjectComponent implements OnInit {
  defaultColumn = {
    title: 'Title column.',
    description: 'Default Description',
  };
  project: IProject | null = null;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private columnService: ColumnService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProject();
    this.subscriptions.add(
      this.projectService.projects$.subscribe((projects) => {
        const projectId = this.route.snapshot.paramMap.get('id');
        if (projectId) {
          const updatedProject = projects.find((proj) => proj.id === projectId);
          if (updatedProject) {
            this.project = updatedProject;
            this.cdr.detectChanges();
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadProject() {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.subscriptions.add(
        this.projectService.projects$
          .pipe(
            map((projects) =>
              projects.find((project) => project.id === projectId)
            )
          )
          .subscribe((project) => {
            if (project) {
              this.project = project;
              this.cdr.detectChanges();
              this.columnService.loadColumns(project.id);
            }
          })
      );
    }
  }

  exitProject() {
    this.router.navigate(['/dashboard']);
  }

  createColumn() {
    const projectId = this.project?.id;

    if (projectId) {
      const { title, description } = this.defaultColumn;
      this.columnService
        .createColumn(String(projectId), String(title), String(description))
        .subscribe({
          next: (newColumn) => {
            if (this.project) {
              const updatedColumns = [
                ...(this.project.columns || []),
                newColumn,
              ];
              const updatedProject = {
                ...this.project,
                columns: updatedColumns,
              };
              this.projectService.updateProjectInSubject(updatedProject);
              this.project = updatedProject;
              this.cdr.detectChanges();
            }
          },
          error: (error) => {
            console.error('Erro na criação da coluna:', error);
          },
        });
    } else {
      console.log('ProjectId not found');
    }
  }
}
