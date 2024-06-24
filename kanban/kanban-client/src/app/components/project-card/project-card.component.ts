import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IProject } from '../../interfaces/project.interfaces';
import { ProjectService } from '../../services/projects/project.service';
import { format } from 'date-fns';
import { UpdateModalProjectComponent } from '../modals/update-modal-project/update-modal-project.component';
import { CommonModule } from '@angular/common';
import { UpdateProjectFormComponent } from '../forms/update-project-form/update-project-form.component';
import { Router } from '@angular/router';
import { StorageService } from '../../services/localStorage.service';
import { ColumnService } from '../../services/columns/column.service';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [
    CommonModule,
    UpdateModalProjectComponent,
    UpdateProjectFormComponent,
  ],
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss'],
})
export class ProjectCardComponent {
  showModal: boolean = false;
  filteredProject: IProject | null = null;

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private columnService: ColumnService,
    private storageService: StorageService
  ) {}

  @Input() project!: IProject;
  @Output() delete = new EventEmitter<string>();

  formatDate(date: string) {
    return format(new Date(date), 'MMM dd, yyyy');
  }

  onDelete() {
    if (this.project) {
      this.delete.emit(this.project.id);
    } else {
      console.error('Id deleted not foud - project card');
    }
  }

  viewProject() {
    if (this.project) {
      this.storageService.setItem('@PROJECT_ID', this.project.id);
      this.router.navigate(['/render-project', this.project.id]);
    }
  }

  toggleModal() {
    this.showModal = !this.showModal;
  }

  getFirstLetter() {
    return this.project?.title
      ? this.project.title.charAt(0).toUpperCase()
      : '';
  }
}
