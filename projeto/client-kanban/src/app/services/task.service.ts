import { gql } from '@apollo/client/core';
import { GraphqlService } from '../services/graphql.service';
import { Injectable } from '@angular/core';
import { CreateTask, UpdateTask } from '../shared/models/task';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private taskCreatedSource = new BehaviorSubject<void>(undefined);
  taskCreated$ = this.taskCreatedSource.asObservable();

  constructor(private graphqlService: GraphqlService) { }

  async createTask(body: CreateTask) {
    const CREATE_TASK = gql`
      mutation CreateTask($body: CreateTask!) {
        createTask(body: $body) {
          id
          description
          sequence
        }
      }
    `;

    return this.graphqlService.client
      .mutate({
        mutation: CREATE_TASK,
        variables: { body },
      })
  }

  async updateTask(body: UpdateTask) {
    const UPDATE_TASK = gql`
      mutation UpdateTask($body: UpdateTask!) {
        updateTask(body: $body) {
          id
          description
          id_column
          sequence
        }
      }
    `;

    return this.graphqlService.client.mutate({
      mutation: UPDATE_TASK,
      variables: { body },
    });
  }

  async manyUpdateTask(body: UpdateTask[]) {
    const MANY_UPDATE_TASK = gql`
      mutation ManyUpdateTask($body: [UpdateTask!]!) {
        manyUpdateTask(body: $body) {
          id
        }
      }
    `;

    return this.graphqlService.client.mutate({
      mutation: MANY_UPDATE_TASK,
      variables: { body },
    });
  }

  async deleteTask(id: number) {
    const DELETE_TASK = gql`
      mutation DeleteTask($deleteTaskId: Float!) {
        deleteTask(id: $deleteTaskId) {
          id
        }
      }
    `;

    return this.graphqlService.client.mutate({
      mutation: DELETE_TASK,
      variables: { deleteTaskId: id },
    });
  }
}