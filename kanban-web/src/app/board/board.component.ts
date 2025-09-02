import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';
import { Quadro, Coluna, Tarefa } from '../models';

@Component({
	selector: 'app-board',
	standalone: true,
	imports: [CommonModule, DragDropModule],
	templateUrl: './board.component.html',
	styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
	quadro?: Quadro;

	constructor(
		private api: ApiService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.api.buscarQuadros().subscribe(quadros => {
			if (quadros.length) {
				this.quadro = quadros[0];
			} else {
				this.api.criarQuadro('Meu Quadro').subscribe(q => (this.quadro = { ...q, colunas: [] }));
			}
		});
	}

	adicionarColuna() {
		if (!this.quadro) return;
		const ordem = this.quadro.colunas?.length || 0;
		this.api.criarColuna(this.quadro.id, 'Nova coluna', ordem).subscribe(coluna => {
			const novaColuna = { ...coluna, tarefas: [] };
			this.quadro!.colunas = [...(this.quadro!.colunas || []), novaColuna];
		});
	}

	adicionarTarefa(coluna: Coluna) {
		const ordem = coluna.tarefas?.length || 0;
		this.api.criarTarefa(coluna.id, 'Nova tarefa', ordem).subscribe(tarefa => {
			coluna.tarefas.push(tarefa);
		});
	}

	excluirColuna(coluna: Coluna) {
		if (confirm(`Tem certeza que deseja excluir a coluna "${coluna.titulo}" e todas as suas tarefas?`)) {
			if (this.quadro) {
				this.quadro.colunas = this.quadro.colunas.filter(c => c.id !== coluna.id);
			}
			
			this.api.excluirColuna(coluna.id).subscribe(
				() => alert('✅ Coluna excluída com sucesso!'),
				(erro) => {
					alert('❌ Erro ao excluir coluna: ' + erro);
					if (this.quadro) {
						this.quadro.colunas.push(coluna);
					}
				}
			);
		}
	}

	//Método para excluir tarefa
	excluirTarefa(tarefa: Tarefa, coluna: Coluna) {
		if (confirm(`Tem certeza que deseja excluir a tarefa "${tarefa.titulo}"?`)) {
			// Remover do array local
			coluna.tarefas = coluna.tarefas.filter(t => t.id !== tarefa.id);
			
			// Excluir no back-end
			this.api.excluirTarefa(tarefa.id).subscribe(
				() => alert('✅ Tarefa excluída com sucesso!'),
				(erro) => {
					alert('❌ Erro ao excluir tarefa: ' + erro);
					// Se der erro, restaurar no array local
					coluna.tarefas.push(tarefa);
				}
			);
		}
	}

	// Método SIMPLES que funcionou
	soltar(evento: CdkDragDrop<Tarefa[]>, paraColuna: Coluna) {
		alert('Movendo tarefa...');
		
		// Vamos fazer um teste simples: mover a primeira tarefa da primeira coluna para a segunda
		if (this.quadro && this.quadro.colunas.length >= 2) {
			const coluna1 = this.quadro.colunas[0];
			const coluna2 = this.quadro.colunas[1];
			
			if (coluna1.tarefas.length > 0) {
				const tarefa = coluna1.tarefas[0];
				
				// Remover da primeira coluna
				coluna1.tarefas = coluna1.tarefas.filter(t => t.id !== tarefa.id);
				
				// Adicionar na segunda coluna
				coluna2.tarefas.push(tarefa);
				
				// Forçar detecção de mudanças
				this.cdr.detectChanges();
				
				alert('Tarefa movida! Verifique se apareceu na segunda coluna.');
			}
		}
	}
}