import { Injectable } from '@angular/core';
import { GraphQLClient, gql } from 'graphql-request';
import { environment } from '../../../enviroments/environment';

//interfaces
import { Task } from '../interface/task.interface';
import { FindAllUserTasksResponse } from '../interface/find-all-user-task-response.interface';


@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private graphQlClient: GraphQLClient;

  constructor() {
    const apiUrl = environment.apiUrl;
    this.graphQlClient = new GraphQLClient(apiUrl);
  }

  async createTask(task: Task) {
    console.log('task a ser criada:', task);
    const mutation = gql`
      mutation CreateTask($createTaskInput: CreateTaskInput!) {
        createTask(createTaskInput: $createTaskInput) {
          _id
          userId
          title
          description
          status
          priorityLevel
          initDate
          endDate
        }
      }
    `;

    return this.graphQlClient.request(mutation, {
      createTaskInput: {
        userId: task.userId,
        title: task.title,
        description: task.description,
        status: task.status,
        priorityLevel: Number(task.priorityLevel),
        initDate: task.initDate,
        endDate: task.endDate,
      },
    });
  }

  async updateTask(task: Task) {
    const mutation = gql`
      mutation UpdateTask($updateTaskInput: UpdateTaskInput!) {
        updateTask(updateTaskInput: $updateTaskInput) {
          _id
          userId
          title
          description
          status
          priorityLevel
          initDate
          endDate
        }
      }
    `;

    return this.graphQlClient.request(mutation, {
      updateTaskInput: {
        _id: task._id,
        userId: task.userId,
        title: task.title,
        description: task.description,
        status: task.status,
        priorityLevel: Number(task.priorityLevel),
        initDate: task.initDate,
        endDate: task.endDate,
      },
    });
  }

  async getTasks(userId: string): Promise<FindAllUserTasksResponse | undefined> {
    const query = gql`
      query FindAllUserTasks($userId: String!) {
        findAllUserTasks(userId: $userId) {
          _id
          userId
          title
          description
          status
          priorityLevel
          initDate
          endDate
        }
      }
    `;
    try {
      const response: FindAllUserTasksResponse =
        await this.graphQlClient.request(query, { userId });
      console.log('tesks encontradas', response);
      return response;
    } catch (error) {
      console.error('Erro ao encontrar tasks ', error);
      return;
    }
  }

  async delete(taskId: string) {
    const id = taskId;
    const mutation = gql`
      mutation RemoveTask($id: String!) {
        removeTask(id: $id) {
          _id
          userId
          title
          description
          status
          priorityLevel
          initDate
          endDate
        }
      }
    `;
    try {
      const response = await this.graphQlClient.request(mutation, { id });
      console.log('task deletada ', response);
      return response;
    } catch (error) {
      console.log('task não pode ser deletada', error);
      return;
    }
  }

  
}
