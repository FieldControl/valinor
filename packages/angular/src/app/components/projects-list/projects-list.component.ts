import { Component, OnInit } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { ActivatedRoute, RouterLink,  } from '@angular/router';
import { Project } from '../../models/kanban.model';
import { KanbanService } from '../../services/kanban.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [ButtonComponent, RouterLink],
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.css',
})
export class ProjectsListComponent implements OnInit {
  projects?: Project[] = [];
  id!: number;

  constructor(
    private serviceKanban: KanbanService,
    private apiService: ApiService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.getAllProjects();
    this.route.queryParams.subscribe((value) => (this.id = value['id']));
  }

  getAllProjects() {
    this.apiService.getAllProjectsDataApi().subscribe((res) => (this.projects = res));
  }

  getEventCreateProject() {
    this.serviceKanban.createNewProject();
  }

  /*
  setCurrentProject(id: number) {
    this.serviceKanban.setCurrentProject(id)
  }
  */
}
