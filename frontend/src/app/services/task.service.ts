import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../environments/enviroment';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`

  async createTask(columnId: string, taskData: { name: string }): Promise<Task> {
    try {
      // Garante que o name é uma string válida
      const name = String(taskData.name).trim();

      const response = await axios.post<Task>(`${this.apiUrl}`, {
        name: name,  // Envia como string explícita
        columnId: columnId
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;

    } catch (error) {
      console.error('Error creating task:', error);
      if (axios.isAxiosError(error)) {
        console.error('Detalhes do erro:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw error;
    }
  }

  async getTasksByColumn(columnId: string): Promise<Task[]> {
    try {
      const response = await axios.get<Task[]>(`${this.apiUrl}/${columnId}`);
      return response.data;
    } catch (error) {
      console.error(`Error loading tasks for column ${columnId}:`, error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      await axios.delete(`${this.apiUrl}/${taskId}`);
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      throw error;
    }
  }

  async updateTaskName(taskId: string, updatedData: { name: string, columnId: string }): Promise<Task> {
    try {
      const response = await axios.put<Task>(`${this.apiUrl}/${taskId}`, updatedData)

      return response.data

    } catch (error) {
      console.log('Error updating name task', error)
      throw error
    }
  }

  async updateTaskColumn(taskId: string, newColumnId: string): Promise<Task> {
    try {
      const response = await axios.patch<Task>(
        `${this.apiUrl}/${taskId}/column`,
        { columnId: newColumnId },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error moving task:', error);
      throw error;
    }
  }

  constructor() { }
}
