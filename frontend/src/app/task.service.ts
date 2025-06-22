import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Task { //Definindo a interface Task
  id?: number; // ID da tarefa, opcional para novas tarefas
  title: string; // Título da tarefa
  description: string; // Descrição da tarefa, opcional
  completed: boolean; // Indica se a tarefa foi concluída
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE'; // Status da tarefa
}


@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/tasks'; // URL da API para tarefas

  constructor(private http: HttpClient) { }


  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  } // Método para obter todas as tarefas


  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  } // Método para obter uma tarefa específica pelo ID

  addTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  } // Método para adicionar uma nova tarefa

  updateTask(task: Task): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${task.id}`, task);
  } // Método para atualizar uma tarefa existente

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  } // Método para excluir uma tarefa pelo ID

}
