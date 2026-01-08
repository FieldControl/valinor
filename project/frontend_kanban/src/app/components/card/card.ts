import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
/**
 * Componente de cartão (card) com título, conteúdo e evento de delete.
 */
export class CardComponent {
  @Input() titulo: string = '';
  @Input() conteudo: string = '';
  @Output() delete = new EventEmitter<void>();

  // Emite evento de deleção para o componente pai
  onDelete(){
    this.delete.emit();
  }
}