import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  project_id = '';

  getId(id: string) {
    this.project_id = id;
    return this.project_id;
  }
}
