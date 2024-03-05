import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { HeaderComponent } from '../../components/header/header.component';
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

@Component({
  selector: 'app-main',
  standalone: true,
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  imports: [
    HeaderComponent,
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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MainComponent implements OnInit {
  @Input() projectId!: string;
  project: Project = {
    _id: '',
    title: '',
  };
  projects: Project[] = [];
  editProjectTitle = new FormControl('Project');
  modalOpen: boolean = false;

  constructor(private api: ApiService) {}

  ngOnInit() {}

  getProjectId(value: any) {
    this.projectId = value;
    this.api.getProjectById(value).subscribe((data) => (this.project = data));
  }

  editProject(projectId: string) {
    const title = this.editProjectTitle.value;
    this.api.updateProjectTitle(projectId, title).subscribe((res) => {
      console.log('renomeado'), res;
    });
    this.openModal();
  }

  deleteProject(projectId: string) {
    this.api.deleteProject(projectId).subscribe((res) => {
      console.log('Projeto Deletado', res);
    });
    this.openModal();
  }

  openModal() {
    this.modalOpen = !this.modalOpen;
  }
}
