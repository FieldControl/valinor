import { Component, EventEmitter, Input, Output, ElementRef } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { type CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem, CdkDrag } from "@angular/cdk/drag-drop"
import { CardComponent } from "../card/card.component"
import { ColumnMenuComponent } from "../column-menu/column-menu.component"
import type { Card, Column } from "../../models/board.model"
import { SortByPipe } from "../../pipes/sort-by.pipe"

@Component({
  selector: "app-column",
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, CardComponent, ColumnMenuComponent, SortByPipe],
  templateUrl: "./column.component.html",
  styleUrls: ["./column.component.scss"],
})
export class ColumnComponent {
  @Input() column!: Column
  @Input() connectedLists: string[] = []

  @Output() addCard = new EventEmitter<Column>()
  @Output() editCard = new EventEmitter<{ card: Card; column: Column }>()
  @Output() deleteCard = new EventEmitter<{ cardId: string; columnId: string }>()
  @Output() updateColumn = new EventEmitter<Column>()
  @Output() deleteColumn = new EventEmitter<string>()
  @Output() cardDropped = new EventEmitter<CdkDragDrop<Card[]>>()

  isEditingTitle = false
  showMenu = false
  editableTitle = ""
  
  constructor(private elementRef: ElementRef) {}

  onTitleClick(): void {
    this.editableTitle = this.column.title
    this.isEditingTitle = true
    setTimeout(() => {
      document.getElementById("column-title-" + this.column.id)?.focus()
    }, 0)
  }

  onTitleBlur(): void {
    if (this.editableTitle.trim()) {
      this.column.title = this.editableTitle.trim().substring(0, 30)
      this.updateColumn.emit(this.column)
    }
    this.isEditingTitle = false
  }

  onTitleKeydown(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      event.preventDefault()
      ;(event.target as HTMLElement).blur()
    } else if (event.key === "Escape") {
      this.isEditingTitle = false
    }
  }

  onAddCard(): void {
    this.addCard.emit(this.column)
  }

  onEditCard(card: Card): void {
    this.editCard.emit({ card, column: this.column })
  }

  onDeleteCard(card: Card): void {
    this.deleteCard.emit({ cardId: card.id, columnId: this.column.id })
  }

  onMenuToggle(): void {
    // Usando requestAnimationFrame para melhorar performance ao abrir o menu
    window.requestAnimationFrame(() => {
      this.showMenu = !this.showMenu;
    });
  }

  onMenuAction(action: string): void {
    switch (action) {
      case "rename":
        this.onTitleClick()
        break
      case "add-card":
        this.onAddCard()
        break
      case "archive":
        // Emitir o evento diretamente para deletar a coluna
        // A confirmação será gerenciada no serviço ao invés de usar o confirm() nativo
        this.deleteColumn.emit(this.column.id)
        break
      case "change-color":
        this.column.color = this.getRandomColor()
        this.updateColumn.emit(this.column)
        break
    }
    this.showMenu = false
  }

  onDrop(event: CdkDragDrop<Card[]>): void {
    // Se o evento não tem dados do card, tentar preencher
    if (!event.item.data && event.previousContainer && event.previousIndex >= 0) {
      const sourceCards = event.previousContainer.data;
      if (Array.isArray(sourceCards) && sourceCards.length > event.previousIndex) {
        event.item.data = sourceCards[event.previousIndex];
      }
    }
    
    // Emitir o evento para o componente pai (board) tratar a lógica principal
    this.cardDropped.emit(event);
  }

  // Método para validar se um card pode ser solto na coluna
  canDrop(): (item: CdkDrag) => boolean {
    return (item: CdkDrag) => {
      // Se não há limite de cards configurado, permite sempre
      if (!this.column.cardLimit) {
        return true;
      }
      
      // Se o card já está nesta coluna, permite a movimentação (reordenação)
      const dragData = item.data as Card;
      if (dragData && this.column.cards.some(c => c.id === dragData.id)) {
        return true;
      }
      
      // Verifica se a coluna já atingiu o limite de cards
      return this.column.cards.length < this.column.cardLimit;
    };
  }

  private getRandomColor(): string {
    const colors = ["#2D8CFF", "#00C781", "#FF647C", "#FFAA15", "#7D4CDB", "#6FFFB0"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Método para otimizar a renderização da lista de cards
  trackByCardId(index: number, card: Card): string {
    return card.id;
  }
}

