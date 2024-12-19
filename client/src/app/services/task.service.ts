import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import {
  CREATE_TASK,
  GET_ALL_TASKS,
  GET_TASKS_BY_STATUS,
  DELETE_TASK,
  UPDATE_NAME,
  UPDATE_DESCRIPTION,
  UPDATE_STATUS,
} from '../graphql/task-queries-mutations';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private apollo: Apollo) {}

  // Método para criar uma nova task
  createTask(name: string, description: string, status: string) {
    return this.apollo
      .mutate<any>({
        mutation: CREATE_TASK,
        variables: { name, description, status },
        update: (cache, { data }) => {
          // Lê os dados do cache, que é a lista atual de tasks
          const existingTasks: any = cache.readQuery({
            query: GET_TASKS_BY_STATUS,
            variables: { status },
          });

          // Verifica se já existem tasks no cache
          if (existingTasks && existingTasks.getTasksByStatus) {
            // Obtém a nova task criada
            const newTask = data?.createTask; // Certifique-se de que está acessando a task corretamente

            // Atualiza o cache com a nova task
            cache.writeQuery({
              query: GET_TASKS_BY_STATUS,
              variables: { status },
              data: {
                getTasksByStatus: [...existingTasks.getTasksByStatus, newTask], // Adiciona a nova task
              },
            });

            console.log('Colunas atualizadas no cache');
          } else {
            console.log('Nenhuma task encontrada no cache');
          }
        },
      })
      .pipe(
        map((result) => {
          return result.data; // Retorna os dados da mutação, se necessário
        })
      );
  }

  getAllTasks() {
    return this.apollo
      .watchQuery({
        query: GET_ALL_TASKS,
      })
      .valueChanges.pipe(
        map((result: any) => {
          // Aqui usamos map para garantir que estamos apenas extraindo e formatando os dados corretamente
          return result.data.getAllTasks.map((task: any) => ({
            id: task.id,
            name: task.name,
            description: task.description,
            status: task.status,
          }));
        })
      );
  }

  // Função para obter as tarefas com base no status
  getTaskByStatus(status: string) {
    return this.apollo
      .watchQuery({
        query: GET_TASKS_BY_STATUS,
        variables: { status },
      })
      .valueChanges.pipe(
        map((result: any) => {
          // Aqui usamos map para garantir que estamos apenas extraindo e formatando os dados corretamente
          return result.data.getTasksByStatus.map((task: any) => ({
            id: task.id,
            name: task.name,
            description: task.description,
            status: task.status,
          }));
        })
      );
  }

  deleteTask(id: string, status: string) {
    return this.apollo.mutate<any>({
      mutation: DELETE_TASK,
      variables: { id },
      update: (cache) => {
        // Lê os dados do cache, que é a lista atual de tasks
        const existingTasks: any = cache.readQuery({
          query: GET_TASKS_BY_STATUS,
          variables: { status },
        });

        // Verifica se as tasks existem no cache
        if (existingTasks && existingTasks.getTasksByStatus) {
          const updatedTasks = existingTasks.getTasksByStatus.filter(
            (task: { id: string }) => task.id !== id
          );

          // Escreve a nova lista de tasks no cache
          cache.writeQuery({
            query: GET_TASKS_BY_STATUS,
            variables: { status },
            data: { getTasksByStatus: updatedTasks },
          });

          console.log('Tarefas atualizadas no cache');
        } else {
          console.log('Nenhuma tarefa encontrada no cache');
        }
      },
    });
  }

  // Método para atualizar o nome da task
  updateName(id: string, newName: string, status: string) {
    return this.apollo.mutate<any>({
      mutation: UPDATE_NAME,
      variables: { id, newName },
      update: (cache, { data }) => {
        // Verifique se a mutação foi bem-sucedida
        if (data && data.updateName === true) {
          const existingTasks: any = cache.readQuery({
            query: GET_TASKS_BY_STATUS,
            variables: { status },
          });

          if (existingTasks.getTasksByStatus) {
            const updatedTasks = existingTasks.getTasksByStatus.map(
              (task: any) =>
                task.id === id
                  ? { ...task, name: newName } // Atualiza o campo name da task
                  : task
            );

            // Atualize o cache com a nova lista de tasks
            cache.writeQuery({
              query: GET_TASKS_BY_STATUS,
              variables: { status },
              data: {
                getTasksByStatus: updatedTasks, // Substitui a lista existente
              },
            });
          }
        }
      }, // Passando os dois parâmetros para a mutação
    });
  }

  // Método para atualizar o status da task
  updateStatus(id: string, newStatus: string, status: string) {
    return this.apollo.mutate<any>({
      mutation: UPDATE_STATUS,
      variables: { id, newStatus },
      update: (cache, { data }) => {
        // Verifique se a mutação foi bem-sucedida
        if (data && data.updateStatus === true) {

          // REMOVER DO CACHE DA COLUNA DE ORIGEM
          const existingTasks: any = cache.readQuery({
            query: GET_TASKS_BY_STATUS,
            variables: { status },
          });
          // Verifica se as tasks existem no cache
          if (existingTasks && existingTasks.getTasksByStatus) {
            const updatedTasks = existingTasks.getTasksByStatus.filter(
              (task: { id: string }) => task.id !== id
            );

            // Escreve a nova lista de tasks no cache
            cache.writeQuery({
              query: GET_TASKS_BY_STATUS,
              variables: { status },
              data: { getTasksByStatus: updatedTasks },
            });
          }

          // ADICIONAR NO CACHE DA COLUNA NOVA
          const tasksNewColumn: any = cache.readQuery({
            query: GET_TASKS_BY_STATUS,
            variables: { status: newStatus },
          });

          // Verifica se o cache da nova coluna já tem tarefas
          const updatedNewStatusTasks = [
            ...(tasksNewColumn?.getTasksByStatus || []), // Se não houver tarefas, começa com um array vazio
            ...existingTasks?.getTasksByStatus.filter(
              (task: { id: string }) => task.id === id
            ), // Adiciona a task removida
          ];

          // Escreve a nova lista de tarefas no cache da nova coluna
          cache.writeQuery({
            query: GET_TASKS_BY_STATUS,
            variables: { status: newStatus },
            data: { getTasksByStatus: updatedNewStatusTasks },
          });
        }
      },
    });
  }

  updateDescription(id: string, newDescription: string, status: string) {
    return this.apollo.mutate<any>({
      mutation: UPDATE_DESCRIPTION,
      variables: { id, newDescription },
      update: (cache, { data }) => {
        // Verifique se a mutação foi bem-sucedida
        if (data && data.updateDescription === true) {
          const existingTasks: any = cache.readQuery({
            query: GET_TASKS_BY_STATUS,
            variables: { status },
          });

          if (existingTasks.getTasksByStatus) {
            const updatedTasks = existingTasks.getTasksByStatus.map(
              (task: any) =>
                task.id === id
                  ? { ...task, description: newDescription } // Atualiza o campo name da task
                  : task
            );

            // Atualize o cache com a nova lista de tasks
            cache.writeQuery({
              query: GET_TASKS_BY_STATUS,
              variables: { status },
              data: {
                getTasksByStatus: updatedTasks, // Substitui a lista existente
              },
            });
          }
        }
      }, // Passando os dois parâmetros para a mutação
    });
  }
}
