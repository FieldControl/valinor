import { Component, CUSTOM_ELEMENTS_SCHEMA, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { HeaderComponent } from '../../components/header/header.component';
import { ColumnComponent } from '../../components/column/column.component';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { ButtonComponent } from '../../components/button/button.component';
import { Project, Task } from '../../models/kanban.model';
import { SideMenuComponent } from '../../components/side-menu/side-menu.component';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { KanbanBoardComponent } from '../../components/kanban-board/kanban-board.component';

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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MainComponent implements OnInit, OnChanges {
  projects?: Project[];
  tasks?: Task[];
  projectId!: string;
  projectTitle!: string;
  changes: any;

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}
  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnInit(): void {
    this.apiService.getAllProjects().subscribe({
      next: (projectsData) => {
        return (this.projects = projectsData);
      },
    });

    this.route.queryParams.subscribe((query) => {
      this.projectId = query['project_id'];
    });
  }
}
