import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { Events } from 'src/app/models/enums/Events';
import { EventAction } from 'src/app/models/interface/EventAction';

import { DeleteCardActions } from 'src/app/models/interface/card/actions/DeleteCardActions';
import { CardsResponse } from 'src/app/models/interface/card/response/CardsResponse';
import { DeleteColumnsActions } from 'src/app/models/interface/column/actions/DeleteColumnsActions';
import { ColumnsResponse } from 'src/app/models/interface/column/response/ColumnsResponse';
import { UserService } from 'src/app/service/user/user.service';
import { DialogComponent } from '../components/dialog/dialog.component';
import { CardService } from './../../../service/card/card.service';
import { ColumnService } from './../../../service/column/column.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();
  private ref!: DynamicDialogRef;
  public columnsDatas: Array<ColumnsResponse> = [];
  public cardsDatas: CardsResponse[] = [];

  public addColumnEvent = Events.ADD_COLUMN_EVENT;
  public editColumnEvent = Events.EDIT_COLUMN_EVENT;
  public addCardEvent = Events.ADD_CARD_EVENT;
  public editCardEvent = Events.EDIT_CARD_EVENT;
  public editColumnToCard = Events.EDIT_COLUMN_TO_CARD;

  constructor(
    private columnService: ColumnService,
    private cardService: CardService,
    private dialogService: DialogService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.getAllColumnsDatas();
    this.getAllCardsDatas();
  }

  getAllColumnsDatas() {
    this.columnService
      .getAllColumns()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.columnsDatas = response;
          }
        },
        error(err) {
          console.log('error');
        },
      });
  }

  getAllCardsDatas() {
    this.cardService
      .getAllCards()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.cardsDatas = response;
          }
        },
        error(err) {
          console.log('error');
        },
      });
  }

  getCardsByColumn(columnId: string): CardsResponse[] {
    return this.cardsDatas.filter((card) => card.columnsTable.id === columnId);
  }

  handleColumnEvent(action: string, id?: string): void {
    if (action === this.addColumnEvent) {
      this.handleEventAction({ action }, this.columnsDatas);
    }

    if (action === this.editColumnEvent) {
      this.handleEventAction({ action, id }, this.columnsDatas);
    }

    if (action === this.editColumnToCard) {
      this.handleEventAction({ action, id }, this.columnsDatas);
    }
  }

  handleCardEvent(action: string, id?: string): void {
    if (action === this.addCardEvent) {
      this.handleEventAction({ action, id }, this.cardsDatas);
    }

    if (action === this.editCardEvent) {
      this.handleEventAction({ action, id }, this.cardsDatas);
    }
  }

  handleEditArrayCards(card: CardsResponse): void {
    let newCardsDatas = [...this.cardsDatas];

    const cardIndex = this.cardsDatas.findIndex((item) => item.id === card.id);

    if (cardIndex !== -1) {
      newCardsDatas[cardIndex] = card;
      this.cardsDatas = newCardsDatas;
    } else {
      newCardsDatas = [...this.cardsDatas, card];
      this.cardsDatas = newCardsDatas;
    }
  }

  handleEditArrayColumns(column: ColumnsResponse): void {
    let newColumnsDatas = [...this.columnsDatas];

    const columnIndex = this.columnsDatas.findIndex(
      (item) => item.id === column.id
    );

    if (columnIndex !== -1) {
      newColumnsDatas[columnIndex] = column;
      this.columnsDatas = newColumnsDatas;
    } else {
      newColumnsDatas = [...this.columnsDatas, column];
      this.columnsDatas = newColumnsDatas;
    }
  }

  handleEventAction(
    event: EventAction,
    data?: ColumnsResponse[] | CardsResponse[]
  ): void {
    if (event) {
      this.ref = this.dialogService.open(DialogComponent, {
        width: '500px',
        contentStyle: { overflow: 'auto', position: 'relative' },
        baseZIndex: 10000,
        closeOnEscape: true,
        maximizable: false,
        closable: false,
        data: {
          event: event,
          data,
        },
        style: {
          style: {
            'min-width': '360px',
          },
        },
      });
      if (this.ref) {
        this.ref.onClose.pipe(takeUntil(this.destroy$)).subscribe({
          next: (result: any) => {
            if (result && result.changed) {
              if (result.dataType === 'cards' && result.data) {
                const card: CardsResponse = {
                  id: result.data.id as string,
                  title: result.data.title as string,
                  description: result.data.description as string,
                  columnsTable: {
                    id: result.data.columnsTable.id as string,
                  },
                  user: {
                    id: result.data.user.id as string,
                    name: result.data.user.name as string,
                  },
                };

                this.handleEditArrayCards(card);
              } else if (result.dataType === 'columns' && result.data) {
                const column: ColumnsResponse = {
                  id: result.data.id,
                  title: result.data.title,
                };

                this.handleEditArrayColumns(column);
              }
            }
          },
        });
      }
    }
  }

  handleDeleteColumnEvent(event: DeleteColumnsActions) {
    if (event) {
      const confirmation = window.confirm(
        `Confirma a exclusão da coluna: ${event.title}?`
      );

      if (confirmation) {
        this.deleteColumn(event.id);
      }
    }
  }

  deleteColumn(id: string) {
    if (id) {
      this.columnService
        .deleteColumn(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response === true) {
              this.columnsDatas = this.columnsDatas.filter(
                (column) => column.id !== id
              );
            }
          },
          error: (err) => {
            console.log(err);
          },
        });
    }
  }

  handleEventDeleteCard(event: DeleteCardActions) {
    if (event) {
      const confirmation = window.confirm(
        `Confirma a exclusão da coluna: ${event.title}?`
      );
      if (confirmation) {
        this.deleteCard(event.id);
      }
    }
  }

  deleteCard(id: string) {
    if (id) {
      this.cardService
        .deleteCard(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response === true) {
              this.cardsDatas = this.cardsDatas.filter(
                (card) => card.id !== id
              );
            }
          },
          error: (err) => {
            console.log(err);
          },
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
