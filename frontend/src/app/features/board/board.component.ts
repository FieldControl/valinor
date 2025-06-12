// src/app/features/board/board.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule }                 from '@angular/common';
import { FormsModule }                  from '@angular/forms';
import { ColumnComponent }              from './column.component';
import { ColumnsApiService }            from '../../core/api/columns-api.service';
import { SocketService }                from '../../core/socket/socket.service';
import { Column }                       from '../../shared/models/column.model';
import { Subject, takeUntil }           from 'rxjs';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ColumnComponent,
  ],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit, OnDestroy {
  columns: Column[] = [];
  newColumnTitle = '';
  private destroy$ = new Subject<void>();

  constructor(
    private colsApi: ColumnsApiService,
    private socket: SocketService,
  ) {}

  ngOnInit() {
    this.reload();

    // inscreve em todos os eventos que o gateway emite
    [
      'columnCreated',
      'columnDeleted',
      'cardCreated',
      'cardDeleted',
      'cardMoved',
    ].forEach(evt =>
      this.socket
        .on<void>(evt)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.reload())
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reload() {
    this.colsApi.getAll().subscribe(cols => {
      this.columns = cols;
      this.newColumnTitle = '';
    });
  }

  createColumn() {
    const title = this.newColumnTitle.trim();
    if (!title) return;
    this.colsApi.create({ title, order: this.columns.length })
      .subscribe(() => this.reload());
  }

  /** IDs de drop-lists conectadas (para cross-column drop) */
  connectedIds(currentId: number): string[] {
    return this.columns
      .map(c => `col-${c.id}`)
      .filter(id => id !== `col-${currentId}`);
  }
}
