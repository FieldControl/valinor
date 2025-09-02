import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Quadro, Coluna, Tarefa } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
	private base = 'http://localhost:3000/kanban';
	constructor(private http: HttpClient) {}

	// Quadros
	buscarQuadros() { return this.http.get<Quadro[]>(`${this.base}/quadros`); }
	buscarQuadro(id: string) { return this.http.get<Quadro>(`${this.base}/quadros/${id}`); }
	criarQuadro(nome: string) { return this.http.post<Quadro>(`${this.base}/quadros`, { nome }); }

	// Colunas
	criarColuna(quadroId: string, titulo: string, ordem: number) {
		return this.http.post<Coluna>(`${this.base}/colunas`, { quadroId, titulo, ordem });
	}
	atualizarColuna(id: string, dados: Partial<Coluna>) { 
		return this.http.patch(`${this.base}/colunas/${id}`, dados); 
	}
	excluirColuna(id: string) { 
		return this.http.delete(`${this.base}/colunas/${id}`); 
	}

	// Tarefas
	criarTarefa(colunaId: string, titulo: string, ordem: number, descricao?: string) {
		return this.http.post<Tarefa>(`${this.base}/tarefas`, { colunaId, titulo, ordem, descricao });
	}
	atualizarTarefa(id: string, dados: Partial<Tarefa>) { 
		return this.http.patch(`${this.base}/tarefas/${id}`, dados); 
	}
	
	excluirTarefa(id: string) { 
		return this.http.delete(`${this.base}/tarefas/${id}`); 
	}
	
	moverTarefa(id: string, paraColunaId: string, paraOrdem: number) {
		return this.http.post(`${this.base}/tarefas/${id}/mover`, { paraColunaId, paraOrdem });
	}
}