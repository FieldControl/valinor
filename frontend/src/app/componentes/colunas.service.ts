import { Injectable } from '@angular/core';
import { Colunas } from './coluna';
import { Tarefa } from './tarefa'; // Importar a nova interface Tarefa
import { Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap, switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ColunasService {
  private readonly API = 'http://localhost:3000/columns';
  private static lastId: number = 0; 

  constructor(private http: HttpClient) {}

  // Listar todas as colunas
  listar(): Observable<Colunas[]> {
    return this.http.get<Colunas[]>(this.API).pipe(
      tap(colunas => {
        ColunasService.lastId = colunas.reduce((max, coluna) => Math.max(max, coluna.id), 0);
      }),
      catchError((error) => {
        console.error('Erro ao listar colunas:', error);
        return throwError(error);
      })
    );
  }

  // Buscar tarefas por ID da coluna
  buscarTarefasPorColuna(colunaId: number): Observable<Tarefa[]> {
    if (!colunaId) {
      console.error('ID da coluna não está definido!');
      return throwError('ID da coluna não está definido');
    }

    return this.http.get<Tarefa[]>(`http://localhost:3000/tasks?colunaId=${colunaId}`).pipe(
      catchError((error) => {
        console.error('Erro ao buscar tarefas por coluna:', error);
        return throwError('Erro ao buscar tarefas');
      })
    );
  }

  // Criar uma nova coluna
  criarColuna(coluna: Colunas): Observable<Colunas> {
    coluna.id = ++ColunasService.lastId; 
    return this.http.post<Colunas>(this.API, coluna).pipe(
      catchError((error) => {
        console.error('Erro ao criar coluna:', error);
        return throwError(error);
      })
    );
  }

  // Criar uma nova tarefa
  criarTarefa(tarefa: Tarefa): Observable<any> { 
    const url = 'http://localhost:3000/tasks'; 
    return this.http.post<any>(url, tarefa).pipe(
      catchError((error) => {
        console.error('Erro ao criar tarefa:', error);
        return throwError(error);
      })
    );
  }

  // Editar uma tarefa existente
  editarTarefa(tarefa: Tarefa): Observable<any> {
    const url = `http://localhost:3000/tasks/${tarefa.id}`; 
    return this.http.put<any>(url, tarefa).pipe(
      catchError((error) => {
        console.error('Erro ao editar tarefa:', error);
        return throwError(error);
      })
    );
  }

  // Buscar uma tarefa por ID
  buscarTarefaPorId(id: number): Observable<Tarefa> {
    const url = `http://localhost:3000/tasks/${id}`; 
    return this.http.get<Tarefa>(url).pipe(
      catchError((error) => {
        console.error('Erro ao buscar tarefa por ID:', error);
        return throwError('Tarefa não encontrada');
      })
    );
  }

  // Editar uma coluna existente
  editarColuna(coluna: Colunas): Observable<Colunas> {
    const url = `${this.API}/${coluna.id}`; 
    return this.http.put<Colunas>(url, coluna).pipe(
      catchError((error) => {
        console.error('Erro ao editar coluna:', error);
        return throwError(error);
      })
    );
  }

  // Excluir uma coluna
  excluirColuna(id: number): Observable<Colunas> {
    const url = `${this.API}/${id}`;
    return this.http.delete<Colunas>(url).pipe(
      catchError((error) => {
        console.error('Erro ao excluir coluna:', error);
        return throwError(error);
      })
    );
  }

  // Excluir uma tarefa
  excluirTarefa(id: number): Observable<void> {
    const url = `http://localhost:3000/tasks/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        console.log(`Tarefa com ID ${id} excluída.`);
      }),
      catchError((error) => {
        console.error(`Erro ao excluir tarefa com ID ${id}:`, error);
        return throwError(error);
      })
    );
  }

  // Buscar uma coluna por ID
  buscarPorId(id: number): Observable<Colunas> {
    const url = `${this.API}/${id}`;
    return this.http.get<Colunas>(url).pipe(
      catchError((error) => {
        console.error('Erro ao buscar coluna por ID:', error);
        return throwError('Coluna não encontrada');
      })
    );
  }
}
