import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Tarefa } from './components/tarefas/tarefa.model';
import { SalvarTarefa } from './components/tarefas/salvar-tarefa.model';

@Injectable({
  providedIn: 'root'
})
export class TarefasService {

  private baseURL = 'http://localhost:3000';
  private endpointTarefas = 'tarefas';
  private atualizacaoSubject = new Subject<void>();

  constructor(private httpClient: HttpClient) { }
  
  notificarAtualizacao(): void {
    this.atualizacaoSubject.next();
  }

  obterListaTarefas(): Observable<Tarefa[]> {
    return this.httpClient.get<Tarefa[]>(`${this.baseURL}/tarefas`);
  }
  
  adicionarTarefa(tarefa: SalvarTarefa): Observable<any> {
    return this.httpClient.post(`${this.baseURL}/${this.endpointTarefas}`, tarefa);
  }
  
  excluirTarefa(id: string): Observable<any> {
    return this.httpClient.delete(`${this.baseURL}/${this.endpointTarefas}/${id}`);
  }

  atualizarTarefa(tarefa: Tarefa): Observable<any> {
    return this.httpClient.put(`${this.baseURL}/${this.endpointTarefas}/${tarefa.idtarefas}`, tarefa);
  }

  listarTarefas(): Observable<Tarefa[]> {
    return this.httpClient.get<Tarefa[]>(`${this.baseURL}/${this.endpointTarefas}`);
  }

}
