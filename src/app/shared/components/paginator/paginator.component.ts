import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Injectable,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { Subject } from 'rxjs';

@Injectable()
export class PortuguesePaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();

  firstPageLabel = $localize`Primeira página`;
  itemsPerPageLabel = $localize`Itens por página:`;
  lastPageLabel = $localize`Útilma página`;

  nextPageLabel = 'Próxima página';
  previousPageLabel = 'Página anterior';

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 1) {
      return $localize`Página 1 de 1`;
    }

    const amountPages = Math.ceil(length / pageSize);
    return $localize`Página ${page} de ${amountPages}`;
  }
}

/**
 * @title Paginator internationalization
 */

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule, MatPaginatorModule],
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  providers: [{ provide: MatPaginatorIntl, useClass: PortuguesePaginatorIntl }],
})
export class PaginatorComponent {
  @Input() totalItems: number;
  @Input() pageIndex: number;
  @Output() pageChanged: EventEmitter<number> = new EventEmitter();

  onPageChange(newPage: PageEvent) {
    this.pageChanged.emit(newPage.pageIndex);
  }
}
