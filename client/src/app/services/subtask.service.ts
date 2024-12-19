import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {
  CREATE_SUBTASK,
  GET_SUBTASKS_BY_TASK,
  DELETE_SUBTASK,
  UPDATE_SUBTASK,
} from '../graphql/subtask-queries-mutations';

@Injectable({
  providedIn: 'root',
})
export class SubtaskService {
  constructor(private apollo: Apollo) {}

  // Método para criar uma nova subtask
  createSubtask(name: string, task: string) {
    return this.apollo
      .mutate<any>({
        mutation: CREATE_SUBTASK,
        variables: { name, task },
        update: (cache, { data }) => {
          // Lê os dados do cache, que é a lista atual de subtasks
          const existingSubtasks: any = cache.readQuery({
            query: GET_SUBTASKS_BY_TASK,
            variables: { task },
          });

          // Verifica se já existem subtasks no cache
          if (existingSubtasks && existingSubtasks.getSubtasksByTask) {
            // Obtém a nova subtask criada
            const newSubtask = data?.createSubtask; // Certifique-se de que está acessando a subtask corretamente

            // Atualiza o cache com a nova subtask
            cache.writeQuery({
              query: GET_SUBTASKS_BY_TASK,
              variables: { task },
              data: {
                getSubtasksByTask: [
                  ...existingSubtasks.getSubtasksByTask,
                  newSubtask,
                ], // Adiciona a nova subtask
              },
            });

            console.log('Colunas atualizadas no cache');
          } else {
            console.log('Nenhuma subtask encontrada no cache');
          }
        },
      })
      .pipe(
        map((result) => {
          return result.data; // Retorna os dados da mutação, se necessário
        })
      );
  }
  // Método para buscar as subtasks baseado na task que elas pertencem
  getSubtasksByTask(task: string) {
    return this.apollo
      .watchQuery({
        query: GET_SUBTASKS_BY_TASK,
        variables: { task },
      })
      .valueChanges.pipe(
        map((result: any) => {
          // Aqui usamos map para garantir que estamos apenas extraindo e formatando os dados corretamente
          return result.data.getSubtasksByTask.map((subtask: any) => ({
            id: subtask.id,
            name: subtask.name,
            task: subtask.task,
            isCompleted: subtask.isCompleted,
          }));
        })
      );
  }

  // Método para deletar subtask
  deleteSubtask(id: string, task: string) {
    return this.apollo.mutate<any>({
      mutation: DELETE_SUBTASK,
      variables: { id },
      update: (cache) => {
        // Lê os dados do cache, que é a lista atual de subtasks
        const existingSubtasks: any = cache.readQuery({
          query: GET_SUBTASKS_BY_TASK,
          variables: { task },
        });

        if (existingSubtasks && existingSubtasks.getSubtasksByTask) {
          const updatedSubtasks = existingSubtasks.getSubtasksByTask.filter(
            (subtask: { id: string }) => subtask.id !== id
          );

          // Escreve a nova lista de subtasks no cache
          cache.writeQuery({
            query: GET_SUBTASKS_BY_TASK,
            variables: { task },
            data: { getSubtasksByTask: updatedSubtasks },
          });
          console.log('Subtasks atualizadas no cache:');
        } else {
          console.log('Nenhuma subtask encontrada no cache');
        }
      },
    });
  }

  // Método para atualizar o status da subtask
  updateSubtask(id: string, isCompleted: boolean, task: string) {
    return this.apollo.mutate<any>({
      mutation: UPDATE_SUBTASK,
      variables: { id, isCompleted },
      update: (cache, { data }) => {
        // Verifique se a mutação foi bem-sucedida
        if (data && data.updateSubtask === true) {
          const existingSubtasks: any = cache.readQuery({
            query: GET_SUBTASKS_BY_TASK,
            variables: { task },
          });
          
          if (existingSubtasks.getSubtasksByTask) {
          const updatedSubtasks = existingSubtasks.getSubtasksByTask.map((subtask: any) =>
            subtask.id === id
              ? { ...subtask, isCompleted } // Atualiza o campo isCompleted da subtask
              : subtask
          );


            // Atualize o cache com a nova lista de subtasks
            cache.writeQuery({
              query: GET_SUBTASKS_BY_TASK,
              variables: { task },
              data: {
                getSubtasksByTask: updatedSubtasks, // Substitui a lista existente
              },
            });
          }
        }
      },
    });
  }
}
