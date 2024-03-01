import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { HeaderComponent } from '../../components/header/header.component';
import { ColumnComponent } from '../../components/column/column.component';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { ButtonComponent } from '../../components/button/button.component';
import { Column, Project, Task } from '../../models/kanban.model';
import { SideMenuComponent } from '../../components/side-menu/side-menu.component';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MainComponent implements OnInit {
  projects?: Project[];
  columns?: Column[];
  tasks?: Task[];
  projectId!: string;
  changes: any;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.apiService.getAllProjects().subscribe({
      next: (projectsData) => {
        return (this.projects = projectsData);
      },
    });

    this.route.queryParams.subscribe((query) => {
      this.projectId = query['project_id'];
    });

    this.apiService.getAllColumns(this.projectId).subscribe((columnsData) => {
      this.columns = columnsData;
      if (this.columns) {
        this.columns?.forEach((data) => {
          this.apiService.getAllTasks(data._id_project, data._id).subscribe((tasksData) => {
            this.tasks = tasksData;
          });
        });
      }
    });
  }

  updateProjectColumns(projectId: string): void {
    this.apiService.getAllColumns(projectId).subscribe((columnsData) => (this.columns = columnsData));
  }
}
