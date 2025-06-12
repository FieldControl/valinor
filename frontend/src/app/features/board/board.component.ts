import { Component, OnInit }      from '@angular/core';
import { CommonModule }           from '@angular/common';
import { ColumnComponent }        from './column.component';
import { ColumnsApiService }      from '../../core/api/columns-api.service';
import { CardsApiService }        from '../../core/api/cards-api.service';
import { Column }                 from '../../shared/models/column.model';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    ColumnComponent,
  ],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  columns: Column[] = [];

  constructor(
    private colsApi: ColumnsApiService,
    private cardsApi: CardsApiService,
  ) {}

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.colsApi.getAll().subscribe(cols => this.columns = cols);
  }

  onCreateColumn() {
    const dto = { title: 'Nova Coluna', order: this.columns.length };
    this.colsApi.create(dto).subscribe(() => this.reload());
  }

  onDeletedColumn() {
    this.reload();
  }
  onCardAdded() {
    this.reload();
  }
  onCardDeleted() {
    this.reload();
  }
  onCardMoved() {
    this.reload();
  }
}
