import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CoinRankingAPIService } from '../../services/coin-ranking-api.service';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.css',
})
export class SearchInputComponent {
  name: string = '';
  @Output() event: EventEmitter<string> = new EventEmitter();

  enviarEvento() {
    this.event.emit(this.name);
  }
}
