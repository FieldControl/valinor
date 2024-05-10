import { Component, Input } from '@angular/core';
import { Column } from './column.interface';
import { KanbanService } from '../kanban.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.css']
})
export class ColumnComponent {
  @Input() column: Column = { _id: 0, name: '', cards: [] };
  @Input() cards: { _id: number, title: string, description: string }[] = [];
  currentColumnId: number = 0;

  constructor(private kanbanService: KanbanService) {}

  addColumn(columnName: string): void {
    if (columnName.trim()) {
      this.kanbanService.createColumn(columnName.trim()).subscribe((createdColumn) => {
        // Adiciona a coluna criada à interface
        // Você pode atualizar a lista de colunas aqui ou apenas mostrar uma mensagem de sucesso
      }, (error) => {
        console.error('Erro ao adicionar a coluna:', error);
        // Trate o erro conforme necessário
      });
    }
  }

  updateColumn(columnId: number, newName: string): void {
    this.kanbanService.updateColumn(columnId, newName).subscribe((updatedColumn) => {
      // Atualiza a coluna na interface
      // Você pode atualizar a lista de colunas aqui ou apenas mostrar uma mensagem de sucesso
    }, (error) => {
      console.error('Erro ao atualizar a coluna:', error);
      // Trate o erro conforme necessário
    });
  }

  deleteColumn(columnId: number): void {
    this.kanbanService.deleteColumn(columnId).subscribe(() => {
      // Remove a coluna da interface
      // Você pode atualizar a lista de colunas aqui ou apenas mostrar uma mensagem de sucesso
    }, (error) => {
      console.error('Erro ao excluir a coluna:', error);
      // Trate o erro conforme necessário
    });
  }

  addCard(columnId: number, title: string, description: string): void {
    if (title.trim() && description.trim()) {
      this.kanbanService.createCard(columnId, title.trim(), description.trim()).subscribe((createdCard) => {
        // Adiciona o card criado à interface
        this.cards.push(createdCard);
      }, (error) => {
        console.error('Erro ao adicionar o card:', error);
        // Trate o erro conforme necessário
      });
    }
  }

    /// Método para lidar com o evento de soltar o card na coluna
  onCardDrop(event: CdkDragDrop<any[]>): void {
    if (event.previousContainer === event.container) {
      // Se o card foi movido dentro da mesma coluna
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Se o card foi movido para outra coluna
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Verifique se o card tem uma propriedade _id e, em seguida, obtenha o valor do _id
      const cardId = event.container.data[event.currentIndex]._id;
      if (cardId) {
        // Atualize o servidor com os dados atualizados das colunas
        const sourceColumnId: number = Number(event.previousContainer.id);
        const targetColumnId: number = Number(event.container.id);
        this.kanbanService.moveCard(sourceColumnId, targetColumnId, cardId).subscribe(() => {
          // Atualização bem-sucedida
        }, (error) => {
          console.error('Erro ao mover o card:', error);
          // Trate o erro conforme necessário
        });
      } else {
        console.error('O card não possui uma propriedade _id válida.');
      }
    }
  }

  setCurrentColumnId(columnId: number): void {
    this.currentColumnId = columnId;
  }
}