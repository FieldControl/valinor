import { Injectable, signal, computed } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

interface Task {
  id: string;
  title: string;
  status: string;
}

interface CreateTaskResponse {
  createTask: Task;
}

interface FinishTaskResponse {
  finishTask: Task;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private tasks = signal<Task[]>([]);

  getTasks() {
    return this.tasks();
  }

  tasksInProcess = computed(() => this.tasks().filter((task) => task.status === 'EM_PROCESSO'));
tasksFinalized = computed(() => this.tasks().filter((task) => task.status === 'FINALIZADO'));

  constructor(private apollo: Apollo) {}

  loadTasks() {
    const GET_TASKS = gql`
      query GET_TASKS {
        getTasks {
          id
          title
          status
        }
      }
    `;

    this.apollo
      .watchQuery<{ getTasks: Task[] }>({
        query: GET_TASKS,
      })
      .valueChanges.subscribe((result) => {
        if (result.data) {
          this.tasks.set(result.data.getTasks);
        }
      });
  }

  addTask(title: string) {
    const CREATE_TASK = gql`
      mutation CREATE_TASK($title: String!) {
        createTask(title: $title) {
          id
          title
          status
        }
      }
    `;

    this.apollo
      .mutate<CreateTaskResponse>({
        mutation: CREATE_TASK,
        variables: { title },
      })
      .subscribe((result) => {
        if (result.data) {
          const newTask = result.data.createTask;
          this.tasks.update((currentTasks) => [...currentTasks, newTask]);
        }
      });
  }

  finishTask(id: string) {
    const FINISH_TASK = gql`
      mutation FINISH_TASK($id: String!) {
        finishTask(id: $id) {
          id
          title
          status
        }
      }
    `;

    this.apollo
      .mutate<FinishTaskResponse>({
        mutation: FINISH_TASK,
        variables: { id },
      })
      .subscribe((result) => {
        if (result.data && result.data.finishTask) {
          const updatedTask = result.data.finishTask;

          this.tasks.update((currentTasks) =>
            currentTasks.map((task) =>
              task.id === updatedTask.id ? updatedTask : task
            )
          );
        }
      });
  }

  revertTaskToInProcess(id: string) {
    const REVERT_TASK = gql`
      mutation REVERT_TASK($id: String!) {
        revertTaskToInProcess(id: $id) {
          id
          title
          status
        }
      }
    `;

    this.apollo
      .mutate({
        mutation: REVERT_TASK,
        variables: { id },
      })
      .subscribe((result: any) => {
        if (result.data && result.data.revertTaskToInProcess) {
          const updatedTask = result.data.revertTaskToInProcess;

          this.tasks.update((currentTasks) =>
            currentTasks.map((task) =>
              task.id === updatedTask.id ? updatedTask : task
            )
          );
        }
      });
  }

  deleteTask(id: string) {
    const DELETE_TASK = gql`
      mutation DELETE_TASK($id: String!) {
        deleteTask(id: $id) {
          id
        }
      }
    `;

    this.apollo
      .mutate({
        mutation: DELETE_TASK,
        variables: { id },
      })
      .subscribe(() => {
        this.tasks.update((currentTasks) =>
          currentTasks.filter((task) => task.id !== id)
        );
      });
  }
}
