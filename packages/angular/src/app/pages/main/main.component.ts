import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { HeaderComponent } from '../../components/header/header.component';
import { ColumnComponent } from '../../components/column/column.component';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { ButtonComponent } from '../../components/button/button.component';
import { Project } from '../../models/kanban.model';
import { ProjectsListComponent } from '../../components/projects-list/projects-list.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: true,
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  imports: [
    HeaderComponent,
    ProjectsListComponent,
    ColumnComponent,
    MatGridListModule,
    TaskCardComponent,
    ButtonComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MainComponent implements OnInit {
  projects!: Project;

  /*
  currentProject: Array<Project> = [
    {
      id: 1,
      title: 'New project',
      columns: [],
    },
  ];
  columns: Array<any> = [];
  cards: Array<any> = [];
  */

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {}

  /*
  getEventCreateColumn(id: number) {
    this.serviceKanban.createNewColumn2(id, 'teste');
    this.projects = this.serviceKanban.projectsData
    this.currentProject = []
    this.currentProject.push(this.serviceKanban.projectsData[0])
  }

  getEventCreateTask() {
    this.serviceKanban.createNewTask('titulo', 'aa');
  }
  */
}
