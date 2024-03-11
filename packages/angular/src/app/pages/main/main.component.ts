import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { ColumnComponent } from '../../components/column/column.component';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { ButtonComponent } from '../../components/button/button.component';
import { Project } from '../../models/kanban.model';
import { SideMenuComponent } from '../../components/side-menu/side-menu.component';
import { ApiService } from '../../services/api.service';
import { MatIconModule } from '@angular/material/icon';
import { KanbanBoardComponent } from '../../components/kanban-board/kanban-board.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  imports: [
    SideMenuComponent,
    ColumnComponent,
    MatGridListModule,
    TaskCardComponent,
    ButtonComponent,
    MatIconModule,
    KanbanBoardComponent,
    ModalComponent,
    ButtonComponent,
    ReactiveFormsModule,
    CommonModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class MainComponent {
  @ViewChild(SideMenuComponent) private sideMenu!: SideMenuComponent;
  editProjectTitle = new FormControl('', { nonNullable: true });
  project: Project = {
    _id: '',
    title: '',
  };
  projects!: Project[];
  openModal: boolean = false;

  constructor(private api: ApiService) {}

  getProjectId(value: string) {
    this.api.getProjectById(value).subscribe({ next: (data) => (this.project = data) });
  }

  editProject(projectId: string) {
    const title = this.editProjectTitle.value;
    this.api.updateProjectTitle(projectId, title).subscribe(() => {
      this.api.getProjectById(projectId).subscribe({ next: (data) => (this.project = data) });
      this.sideMenu.updateList();
    });
    this.openCloseModal();
  }

  deleteProject(projectId: string) {
    this.api.deleteProject(projectId).subscribe(() => {
      window.location.reload();
    });
  }

  openCloseModal() {
    this.openModal = !this.openModal;
  }
}
