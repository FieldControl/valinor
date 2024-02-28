import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HeaderComponent implements OnInit {
  title?: string = '';
  id: number = 0;
  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((value) => (this.id = value['id']));
    this.getProjectDataById(this.id);
  }

  getProjectDataById(id: number): void {
    this.apiService.getProjectsDataApiById(id).subscribe((res) => (this.title = res.title));
  }
}
