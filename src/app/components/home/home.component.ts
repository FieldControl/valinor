import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { KanbanService } from '../../kanban.service';
import { OnInit } from '@angular/core';
//Criação da interface/CRUD
interface Column {
  id: string;
  nome: string;
  cards: Card[];
}

interface Card {
  id: string;
  nome: string;
  descricao: string;
  colunaId: number;  // Adicionando a propriedade colunaId
  coluna: Column;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  tb_coluna: Column[] = [];
  tb_cards: any[] = [];
  newColumnTitle = '';
  newCardTitles: { [key: string]: string } = {};
  newCardDescriptions: { [key: string]: string } = {}; 
  editingColumnId: string | null = null;
  editingCardId: string | null = null;
  editColumnTitle = '';
  editCardTitle = '';
  editCardDescription = '';

  constructor(private kanbanService: KanbanService) {}

  ngOnInit() {
    this.loadColumns();
  }
  addColumn() {
    if (this.newColumnTitle.trim()) {
      const novaColuna = {
        nome: this.newColumnTitle
      };
      
      this.kanbanService.criarColuna(novaColuna).subscribe({
        next: (response) => {
          this.tb_coluna.push({...response, cards: []});
          this.newColumnTitle = '';
        },
        error: (error) => {
          console.error('Erro ao criar coluna:', error);
        }
      });
    }
  }

  loadColumns() {
    this.kanbanService.getColunas().subscribe({
      next: (response) => {
        if (response) {
          this.tb_coluna = response.map(col => ({
            ...col,
            cards: []
          }));
          // Carrega os cards depois que as colunas estiverem prontas
          this.loadCards();
        }
      },
      error: (error) => console.error('Erro ao carregar colunas:', error)
    });
  }

  
  addCard(columnId: string) {
    console.log('Iniciando criação do card');
    const column = this.tb_coluna.find(col => col.id === columnId);
    if (column && this.newCardTitles[columnId]?.trim()) {
      const newCard = {
        nome: this.newCardTitles[columnId],
        descricao: this.newCardDescriptions[columnId] || 'Nova tarefa',
        colunaId: parseInt(columnId)
      };
      
      this.kanbanService.criarCard(newCard).subscribe({
        next: (response) => {
          if (response && column.cards) {
            console.log('Card criado com sucesso:', response);
            this.loadCards(); 
            this.newCardTitles[columnId] = '';
            this.newCardDescriptions[columnId] = '';
          }
        },
        error: (error) => {
          console.error('Erro ao criar card:', error);
        }
      });
    }
  }

  loadCards() {
    this.kanbanService.getCards().subscribe({
      next: (response) => {
        if (response) {
          this.tb_cards = response;
          // Limpa os cards existentes em todas as colunas
          this.tb_coluna.forEach(col => {
            col.cards = [];
          });
          
          this.tb_cards.forEach(card => {
            const coluna = this.tb_coluna.find(col => col.id === card.colunaId);
            if (coluna) {
              if (!coluna.cards) {
                coluna.cards = [];
              }
              coluna.cards.push(card);
            }
          });
          console.log('Colunas após distribuição dos cards:', this.tb_coluna);
        }
      },
      error: (error) => console.error('Erro ao carregar cards:', error)
    });
  }

  startEditingColumn(column: Column) {
    this.editingColumnId = column.id;
    this.editColumnTitle = column.nome;
  }

  saveColumnEdit(column: Column) {
    if (this.editColumnTitle.trim() && this.editingColumnId) {
      this.kanbanService.editarColuna(parseInt(column.id), {
        nome: this.editColumnTitle
      }).subscribe({
        next: (response) => {
          column.nome = this.editColumnTitle;
          this.editingColumnId = null;
          this.editColumnTitle = '';
        },
        error: (error) => {
          console.error('Erro ao editar coluna:', error);
        }
      });
    }
  }

  startEditingCard(card: Card) {
    this.editingCardId = card.id;
    this.editCardTitle = card.nome;
    this.editCardDescription = card.descricao;
  }

  saveCardEdit(card: Card) {
    if (this.editCardTitle.trim() && this.editingCardId) {
      this.kanbanService.editarCard(parseInt(card.id), {
        nome: this.editCardTitle,
        descricao: this.editCardDescription
      }).subscribe({
        next: (response) => {
          card.nome = this.editCardTitle;
          card.descricao = this.editCardDescription;
          this.editingCardId = null;
          this.editCardTitle = '';
          this.editCardDescription = '';
        },
        error: (error) => {
          console.error('Erro ao editar card:', error);
        }
      });
    }
  }

  cancelEdit() {
    this.editingColumnId = null;
    this.editingCardId = null;
    this.editColumnTitle = '';
    this.editCardTitle = '';
    this.editCardDescription = '';
  }

  deleteColumn(column: Column) {
    if (confirm('Tem certeza que deseja excluir esta coluna? Todos os cards serão excluídos também.')) {
      this.kanbanService.deletarColuna(parseInt(column.id)).subscribe({
        next: () => {
          this.tb_coluna = this.tb_coluna.filter(col => col.id !== column.id);
        },
        error: (error) => {
          console.error('Erro ao excluir coluna:', error);
        }
      });
    }
  }
  
  deleteCard(card: Card, column: Column) {
    if (confirm('Tem certeza que deseja excluir este card?')) {
      this.kanbanService.deletarCard(parseInt(card.id)).subscribe({
        next: () => {
          column.cards = column.cards.filter(c => c.id !== card.id);
        },
        error: (error) => {
          console.error('Erro ao excluir card:', error);
        }
      });
    }
  }
  carregarColunas() {
    this.kanbanService.getColunas().subscribe(columns => {
      this.tb_coluna = columns;
    });
  }

  getConnectedLists(): string[] {
    return this.tb_coluna.map(column => column.id.toString());
  }

  drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      const movedCard = event.container.data[event.currentIndex];
      // Convertendo o ID da coluna para número antes da comparação
      const coluna = this.tb_coluna.find(col => col.id === movedCard.colunaId.toString());
      console.log(event.container.id);
        const cardAtualizado = {
          ...movedCard,
          colunaId: parseInt(event.container.id)
        };
  
        this.kanbanService.atualizarCard(parseInt(movedCard.id), cardAtualizado).subscribe({
          next: (response) => {
            console.log('Card atualizado com sucesso:', response);
          },
          error: (error) => {
            console.error('Erro ao atualizar card:', error);
            transferArrayItem(
              event.container.data,
              event.previousContainer.data,
              event.currentIndex,
              event.previousIndex
            );
          }
        });
    }
  }
}
