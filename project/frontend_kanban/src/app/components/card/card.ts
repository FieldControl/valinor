import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class CardComponent {
  @Input() titulo: string = '';
  @Input() conteudo: string = '';
  @Output() delete = new EventEmitter<void>();

  onDelete(){
    this.delete.emit();
  }
}