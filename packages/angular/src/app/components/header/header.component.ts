import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { Project } from '../../models/kanban.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HeaderComponent implements OnInit {
  getTitle: any;
  title!: string;
  project_id!: string;

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.apiService.getAllProjects().subscribe((projects) => {
      this.getTitle = projects;
      this.title = this.getTitle[0].title;
    });

    this.route.queryParams.subscribe((value) => {
      this.project_id = value['project_id'];
      if (this.project_id) {
        this.apiService.getProjectById(this.project_id).subscribe((project) => (this.title = project.title));
      }
    });
  }
}
