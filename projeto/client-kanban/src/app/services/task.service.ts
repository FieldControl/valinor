import { gql } from '@apollo/client/core';
import { GraphqlService } from '../services/graphql.service';
import { Injectable } from '@angular/core';
import { CreateTask } from '../shared/models/task';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private taskCreatedSource = new BehaviorSubject<void>(undefined);
  taskCreated$ = this.taskCreatedSource.asObservable();

  constructor(private graphqlService: GraphqlService) {}

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
      .then((result) => {
        this.taskCreatedSource.next(); // Emitir evento ao criar uma task
        return result;
      });
  }
}