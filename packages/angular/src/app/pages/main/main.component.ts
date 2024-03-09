import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
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
import { KanbanService } from '../../services/kanban.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

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
    CommonModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class MainComponent implements OnInit {
  @ViewChild(SideMenuComponent) private sideMenu!: SideMenuComponent;
  @Input() projectId = signal<string>('');
  project: Project = {
    _id: '',
    title: '',
  };
  projects!: Project[];
  editProjectTitle = new FormControl('Project');
  modal: boolean = false;

  constructor(private api: ApiService) {}

  ngOnInit() {}

  getProjectId(value: any) {
    this.projectId = value;
    this.api.getProjectById(value).subscribe({ next: (data) => (this.project = data) });
  }

  editProject(projectId: string) {
    const title = this.editProjectTitle.value;
    this.api.updateProjectTitle(projectId, title).subscribe((res) => {
      this.api.getProjectById(projectId).subscribe({ next: (data) => (this.project = data) });
      this.sideMenu.updateList();
    });
    this.openCloseModal();
  }

  deleteProject(projectId: string) {
    this.api.deleteProject(projectId).subscribe((res) => {
      window.location.reload();
    });
  }

  openCloseModal() {
    this.modal = !this.modal;
  }
}
