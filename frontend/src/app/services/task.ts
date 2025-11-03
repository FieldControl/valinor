import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface TaskProps {
  id: string;
  name: string;
  description: string;
  create_at: Date
}


@Injectable({
  providedIn: 'root',
})
export class Task {
  private apiUrl = 'http://localhost:3000/task'

  constructor(private http: HttpClient) {}

  getTask() {
    return this.http.get<TaskProps[]>(this.apiUrl)
  }

  postTask(task: TaskProps) {
    return this.http.post<TaskProps>(this.apiUrl, task)
  }

  deleteTask(id: string) {
    return this.http.delete<string>(`${this.apiUrl}/${id}`)
  }

  updateTask(id: string | null, task: TaskProps) {
    return this.http.patch<TaskProps>(`${this.apiUrl}/${id}`, task)
  }
}
