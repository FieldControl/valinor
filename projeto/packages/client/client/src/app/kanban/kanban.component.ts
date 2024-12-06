// Importação para utilizar dentro do componente
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { KanbanService } from './kanban.service';  // Serviço para consumir as APIs do back-end

@Component({
  selector: 'app-kanban',
  standalone: true, //Como essa versão do angular não possui kanban.module, ele trabalha em modo standalone (sofri muito para conseguir encontrar isso)
  imports: [CommonModule, FormsModule],
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css']
})
export class KanbanComponent implements OnInit {
  colunas: any[] = [];           // Variável para armazenar as colunas
  tituloColuna: string = '';     // Variável para armazenar o título da nova coluna
  tituloCard: string = '';       // Variável para armazenar o título do novo card
  descricaoCard: string = '';    // Variável para armazenar a descrição do card

  constructor(private kanbanService: KanbanService) {}

  ngOnInit(): void {
    this.getColunas();  // Chama o método para obter as colunas ao inicializar o componente
  }

  // Método para buscar as colunas do back-end
  getColunas(): void {
    this.kanbanService.pegaColunas().subscribe((colunas) => {
      this.colunas = colunas;
      console.log(colunas);
    });
  }

  // Método para criar uma nova coluna
  criarColuna() {
    if (this.tituloColuna.trim()) {
      this.kanbanService.criaColuna(this.tituloColuna).subscribe((coluna) => {
        this.colunas.push(coluna);   // Adiciona a nova coluna à lista
        this.tituloColuna = '';      // Limpa o campo de título da coluna
      });
    }
  }

 // Método para adicionar um novo card a uma coluna
  adicionarCard(colunaId: number, index: number): void {
    console.log('colunaId recebido: ', colunaId);
    const titulo = this.colunas[index].tituloCard;
    const descricao = this.colunas[index].descricaoCard;

    if (titulo.trim() && descricao.trim()) {
      this.kanbanService.criaCard(colunaId, titulo.trim(), descricao.trim()).subscribe((card) => {
        const coluna = this.colunas.find((c) => c.id === colunaId);  // Encontra a coluna com base no ID
        if (coluna) {
          coluna.cards.push(card);  // Adiciona o card à coluna correspondente
        }
        this.colunas[index].tituloCard = '';      // Limpa o campo de título do card
        this.colunas[index].descricaoCard = '';   // Limpa o campo de descrição do card
        this.getColunas();
      });
    }
  }

  editarCard(colunaId: number, cardIndex: number): void{
    const card = this.colunas.find((coluna) => coluna.idColuna === colunaId)?.cards[cardIndex]; //Cria uma constante para armazenar o colunaId juntamente do index do card.
    if (card){
      card.editing = true;
    }
  }

  deletarCard(colunaId: any, cardIndex: number): void {
    const cardId = this.colunas.find(coluna => coluna.idColuna === colunaId)?.cards[cardIndex]?.idCard;
    
    // Garantir que colunaId seja um número
    const colunaIdNum = Number(colunaId); // Converte para número
    
    if (cardId) {
      this.kanbanService.deletarCard(colunaIdNum, cardId).subscribe(
        () => {
          // Remover o card da lista local após a exclusão bem-sucedida
          const coluna = this.colunas.find(coluna => coluna.idColuna === colunaId);
          if (coluna) {
            coluna.cards.splice(cardIndex, 1); // Remove o card do array local
          }
        },
      );
    }
  }

  salvarEdicao(colunaId: number, cardIndex: number): void {
    const card = this.colunas.find((coluna) => coluna.idColuna === colunaId)?.cards[cardIndex];
    if (card) {
        this.kanbanService.editarCard(colunaId, card.idCard, card.titulo, card.descricao).subscribe(() => {
            card.editing = false; // Sai do modo de edição após salvar
        });
    }
  }

  editarTituloColuna(coluna: any): void{
    coluna.editing = true; // Permite editar a coluna
  }

  salvarTituloColuna(coluna: any): void {
    if (coluna.novoTitulo.trim()) {
      const idColuna = String(coluna.idColuna); // Converte para string numérica
      this.kanbanService.editarColuna(idColuna, coluna.novoTitulo).subscribe(() => {
        coluna.titulo = coluna.novoTitulo; // Atualiza o título localmente
        coluna.novoTitulo = '';           // Limpa o campo temporário
        coluna.editing = false;           // Sai do modo de edição
      });
    }
  }

}
