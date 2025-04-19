import { Injectable } from '@angular/core';
import { GraphQLClient, gql } from 'graphql-request';

//interfaces
import { Task } from '../interface/task.interface';
import { FindAllUserTasksResponse } from '../interface/find-all-user-task-response.interface';



@Injectable({
  providedIn: 'root'
})

export class TaskService {
  
  private graphQlClient: GraphQLClient;

  
  constructor() {
    const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:3333/api';
    this.graphQlClient = new GraphQLClient(apiUrl);
  }

  async createTask(task: Task) {
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
        priorityLevel: task.priorityLevel,
        initDate: task.initDate,
        endDate: task.endDate
      }
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
        priorityLevel: task.priorityLevel,
        initDate: task.initDate,
        endDate: task.endDate
      }
    });
  }

  async  getTasks(userId:string): Promise<FindAllUserTasksResponse | undefined>{
    const query = gql`
        query FindAllUserTasks($userId: String!){
          findAllUserTasks(userId: $userId){
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
      
      `
      try{
        const response:FindAllUserTasksResponse = await this.graphQlClient.request(query,
          {userId}
        )
        console.log('tesks encontradas', response)
        return response;
      }catch(error){
        console.error('Erro ao encontrar tasks ', error)
        return;
      }
  }
}