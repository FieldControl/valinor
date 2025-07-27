import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';

export interface Task {
  id: number;
  name: string;
  desc: string;
  step: number;
}

export const GET_TASKS = gql` 
  query Tasks {
    tasks {
      id
      name
      desc
      step
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor(private apollo: Apollo) {}

  getTasks(): Observable<Task[]> {
    return this.apollo
      .watchQuery<{ tasks: Task[] }>({
        query: GET_TASKS,
      })
      .valueChanges.pipe(map(result => result.data.tasks));
  }

  createTask(name: string, desc: string, step: number): Observable<Task> {
    return this.apollo.mutate<{ createTask: Task }>({
      mutation: gql`
        mutation CreateTask($name: String!, $desc: String!, $step: Int!) {
          createTask(createTaskInput: { name: $name, desc: $desc, step: $step }) {
            id
            name
            desc
            step
          }
        }
      `,
      variables: { name, desc, step },
      refetchQueries: [{ query: GET_TASKS }],
    }).pipe(map(result => result.data!.createTask));
  }

  updateTask(id: number, name: string, desc: string, step: number): Observable<Task> {
    return this.apollo.mutate<{ updateTask: Task }>({
      mutation: gql`
        mutation UpdateTask($id: Int!, $name: String!, $desc: String!, $step: Int!) {
          updateTask(updateTaskInput: { id: $id, name: $name, desc: $desc, step: $step }) {
            id
            name
            desc
            step
          }
        }
      `,
      variables: { id, name, desc, step },
      refetchQueries: [{ query: GET_TASKS }],
    }).pipe(map(result => result.data!.updateTask));
  }

  removeTask(id: number): Observable<Task> {
  return this.apollo.mutate<{ removeTask: Task }>({
    mutation: gql`
      mutation($id: Int!) {
        removeTask(id: $id) {
          id
          name
          desc
          step
        }
      }
    `,
    variables: { id },
    refetchQueries: [{ query: GET_TASKS }],
  }).pipe(map(result => result.data!.removeTask));
}
}
