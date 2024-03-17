import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Events } from 'src/app/models/enums/Events';
import { EventAction } from 'src/app/models/interface/EventAction';
import { DeleteCardActions } from 'src/app/models/interface/card/actions/DeleteCardActions';
import { CardsResponse } from 'src/app/models/interface/card/response/CardsResponse';

@Component({
  selector: 'app-columns',
  templateUrl: './columns.component.html',
  styleUrls: ['./columns.component.scss'],
})
export class ColumnsComponent {
  @Input() title!: string;
  @Input() id!: string;
  @Input() cards: Array<CardsResponse> = [];
  @Output() editColumnEvent = new EventEmitter();
  @Output() deleteColumnEvent = new EventEmitter();
  @Output() addCardEvent = new EventEmitter();
  @Output() editCardEvent = new EventEmitter();
  @Output() deleteCardEvent = new EventEmitter();
  @Output() editColumnToCardEvent = new EventEmitter();

  public columnEventEdit = Events.EDIT_COLUMN_EVENT;
  public AddCardEvent = Events.ADD_CARD_EVENT;

  handleColumnEditEvent(action: string, id: string): void {
    if (action !== '' && id !== '') {
      this.editColumnEvent.emit({ action, id });
    }
  }

  handleColumnDeleteEvent(title: string, id: string): void {
    if (title !== '' && id !== '') {
      this.deleteColumnEvent.emit({ title, id });
    }
  }

  handleEditCardEvent(event: EventAction): void {
    this.editCardEvent.emit(event);
  }

  handleAddCardEvent(action: string, id: string): void {
    this.addCardEvent.emit({ action, id });
  }

  handleDeleteCardEvent(event: DeleteCardActions): void {
    this.deleteCardEvent.emit(event);
  }

  handleEditColumnToCardEvent(event: EventAction): void {
    this.editColumnToCardEvent.emit(event);
  }
}
