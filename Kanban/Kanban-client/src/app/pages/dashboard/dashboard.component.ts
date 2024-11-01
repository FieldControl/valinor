import { Component, OnInit } from '@angular/core';
import { ProjectListComponent } from '../../components/project-list/project-list.component';
import { InsertModalProjectComponent } from '../../components/modals/insert-modal-project/insert-modal-project.component';
import { CommonModule } from '@angular/common';
import { RegisterProjectFormComponent } from '../../components/forms/register-project-form/register-project-form.component';
import { ProjectService } from '../../services/projects/project.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ProjectListComponent,
    InsertModalProjectComponent,
    RegisterProjectFormComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  showModal: boolean = false;
  projectsSubscription: Subscription | undefined;

  constructor(private projectService: ProjectService) {
    this.projectService.getAllProjects();
  }

  ngOnInit(): void {
    this.projectService.getAllProjects();
  }

  toggleModal() {
    this.showModal = !this.showModal;
  }
}
