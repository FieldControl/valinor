import { Component, Input, OnInit } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  @Input() projects: any;
  project_id?: string;

  constructor(
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.project_id = params['project_id'];
    });
  }
}
