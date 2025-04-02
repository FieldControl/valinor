import { Component, EventEmitter, Input, Output } from "@angular/core"
import { CommonModule } from "@angular/common"
import type { Card } from "../../models/board.model"

@Component({
  selector: "app-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./card.component.html",
  styleUrls: ["./card.component.scss"],
})
export class CardComponent {
  @Input() card!: Card
  @Output() editCard = new EventEmitter<Card>()
  @Output() deleteCard = new EventEmitter<Card>()

  onCardClick(): void {
    this.editCard.emit(this.card)
  }

  onDoubleClick(event: MouseEvent): void {
    event.stopPropagation()
    this.editCard.emit(this.card)
  }

  onDeleteClick(event: MouseEvent): void {
    event.stopPropagation()
    if (confirm('Tem certeza que deseja remover este card?')) {
      this.deleteCard.emit(this.card)
    }
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return "";
    
    try {
      console.log(`Formatando data no card: ${this.card.title}, valor original:`, date);
      
      // Converter para Date se for string
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Verificar se a data é válida
      if (isNaN(dateObj.getTime())) {
        console.error('Data inválida:', date);
        return "";
      }
      
      // Usar opções mais específicas de formatação
      const options: Intl.DateTimeFormatOptions = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      };
      
      const formatted = dateObj.toLocaleDateString(undefined, options);
      console.log(`Data formatada: ${formatted}`);
      return formatted;
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return "";
    }
  }

  getTagStyle(color: string): object {
    return {
      backgroundColor: color,
      color: this.getContrastColor(color),
    }
  }

  private getContrastColor(hexColor: string): string {
    // Convert hex to RGB
    const r = Number.parseInt(hexColor.substr(1, 2), 16)
    const g = Number.parseInt(hexColor.substr(3, 2), 16)
    const b = Number.parseInt(hexColor.substr(5, 2), 16)

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    // Return black or white based on luminance
    return luminance > 0.5 ? "#000000" : "#FFFFFF"
  }
}

