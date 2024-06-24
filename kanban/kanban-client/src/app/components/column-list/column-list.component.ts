import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IColumn } from '../../interfaces/column.interfaces';
import { ColumnService } from '../../services/columns/column.service';
import { IProject } from '../../interfaces/project.interfaces';
import {
  CdkDragDrop,
  moveItemInArray,
  CdkDrag,
  CdkDropList,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { BehaviorSubject, Observable, map, take } from 'rxjs';
import { ColumnCardComponent } from '../column-card/column-card.component';
import { TaskListComponent } from '../task-list/task-list.component';
import { ProjectService } from '../../services/projects/project.service';
import { StorageService } from '../../services/localStorage.service';

@Component({
  selector: 'app-column-list',
  standalone: true,
  imports: [
    CommonModule,
    CdkDropList,
    CdkDrag,
    DragDropModule,
    ColumnCardComponent,
    TaskListComponent,
  ],
  templateUrl: './column-list.component.html',
  styleUrls: ['./column-list.component.scss'],
})
export class ColumnListComponent implements OnInit, OnChanges {
  @Input() project: IProject | null = null;
  columns$: Observable<IColumn[]> | undefined;
  private columnsSubject = new BehaviorSubject<IColumn[]>([]);
  connectedDropLists: string[] = [];

  constructor(
    private columnService: ColumnService,
    private projectService: ProjectService,
    private storageService: StorageService,
    private cdr: ChangeDetectorRef
  ) {}

  loadProjectAndColumns() {
    const projectId = this.storageService.getItem('@PROJECT_ID');
    if (projectId) {
      this.projectService.getProjectById(projectId).subscribe((project) => {
        this.project = project;
        if (project) {
          this.columns$ = this.projectService.projects$.pipe(
            map((projects) => {
              const project = projects.find((p) => p.id === projectId);
              const columns = project ? [...(project.columns || [])] : [];
              this.connectedDropLists = columns.map((column) => column.id);
              return columns.sort((a, b) => a.order - b.order);
            }),
            map((columns) => columns || [])
          );
        }
      });
    }
  }

  loadColumns() {
    if (this.project) {
      this.columnService.getColumns(this.project.id).subscribe((columns) => {
        this.columnsSubject.next(columns);
        this.cdr.detectChanges();
      });
    }
  }

  ngOnInit() {
    this.columns$ = this.columnsSubject.asObservable();
    this.loadProjectAndColumns();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['project'] && changes['project'].currentValue) {
      this.loadColumns();
    }
  }

  onDeleteColumn(columnId: string) {
    if (this.project) {
      this.columnService.deleteColumn(columnId, this.project.id).subscribe({
        next: (success) => {
          if (success) {
            this.projectService.projects$
              .pipe(take(1))
              .subscribe((projects) => {
                const updatedProjects = projects.map((project) => {
                  if (project.id === this.project!.id) {
                    const updatedColumns = (project.columns || []).filter(
                      (col) => col.id !== columnId
                    );
                    return { ...project, columns: updatedColumns };
                  }
                  return project;
                });

                this.projectService.updateProjects(updatedProjects);

                const updatedProject = updatedProjects.find(
                  (proj) => proj.id === this.project!.id
                );
                if (updatedProject) {
                  this.project = updatedProject;
                  this.cdr.detectChanges();
                }
              });
          } else {
            console.error('Failed to delete column');
          }
        },
        error: (error) => {
          console.error('Failed to delete column', error);
        },
      });
    }
  }

  dropColumn(event: CdkDragDrop<IColumn[]>) {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const columns = [...(this.project?.columns || [])];
    moveItemInArray(columns, event.previousIndex, event.currentIndex);

    const updatedColumns = columns.map((col, index) => ({
      ...col,
      order: index,
    }));

    this.columnService.updateColumns(updatedColumns).subscribe({
      next: (success) => {
        if (success) {
          if (this.project) {
            this.project = { ...this.project, columns: updatedColumns };
            this.columnsSubject.next(updatedColumns);
            this.updateProjectColumns(updatedColumns);
            this.cdr.detectChanges();
          }
        } else {
          console.error('Failed to update column positions');
        }
      },
      error: (err) => {
        console.error('Failed to update column positions', err);
      },
    });
  }

  private updateProjectColumns(updatedColumns: IColumn[]) {
    this.projectService.projects$.pipe(take(1)).subscribe((projects) => {
      const updatedProjects = projects.map((project) => {
        if (project.id === this.project?.id) {
          return { ...project, columns: updatedColumns };
        }
        return project;
      });

      this.projectService.updateProjects(updatedProjects);
      const updatedProject = updatedProjects.find(
        (proj) => proj.id === this.project?.id
      );

      if (updatedProject) {
        this.project = { ...updatedProject };
        this.columnsSubject.next(updatedColumns);
        this.cdr.detectChanges();
      }
    });
  }
}
