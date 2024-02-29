import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Project } from '../models/kanban.model';

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  projectsData: Array<Project> = [];

  constructor(private apiService: ApiService) {}
}
