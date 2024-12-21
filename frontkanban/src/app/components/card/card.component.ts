import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';




@Component({
  selector: 'app-card',
  imports: [FontAwesomeModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  faXmark = faXmark;
  @Input() title!: string; 
  @Output() close = new EventEmitter<void>(); 
  closed(){
    this.close.emit();
  }
}
