import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit, Output } from '@angular/core';
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
export class HeaderComponent {
  constructor() {}

  ngOnInit(): void {}
}
