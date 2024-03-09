import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Project } from '../models/kanban.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  allProjects!: Project[];

  constructor(private api: ApiService) {}

}
