import { CdkDrag } from '@angular/cdk/drag-drop';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  signal,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { UiButtonComponent } from '@shared/components/ui/ui-button/ui-button.component';
import { UiDropdownComponent } from '@shared/components/ui/ui-dropdown/ui-dropdown.component';
import { UiInputComponent } from '@shared/components/ui/ui-input/ui-input.component';
import { IconPlus } from '@shared/icons/plus.component';
import { Columns } from '@type/types';
import { CardComponent } from '../card/card.component';
import { ColumnService } from './column.service';

@Component({
  selector: 'column',
  imports: [
    UiButtonComponent,
    CdkDrag,
    UiInputComponent,
    IconPlus,
    UiInputComponent,
    CardComponent,
    UiDropdownComponent,
  ],
  templateUrl: './column.component.html',
  styleUrl: './column.component.scss',
})

export class ColumnComponent {
  @ViewChild(UiInputComponent) inputNewTask!: UiInputComponent;
  @ViewChild('newTaskContainer') newTaskContainer!: ElementRef<HTMLDivElement>;
  @Input() columnData!: Columns;
  @Output() deleteColumn = new EventEmitter<string>();

  showInput = signal(false);
  newCardTitle = new FormControl('');

  constructor(private columnService: ColumnService) { }

  disableInput = () => {
    this.showInput.set(false);
    this.newCardTitle.setValue('');
  };

  enableInput = () => {
    this.showInput.set(true);
  };

  addNewCardToColumn = () => {
    if (!this.newCardTitle.value?.trim()) return;
    this.columnService.addCard(this.newCardTitle.value, this.columnData.id)
      .subscribe((data) => {
        if (!this.columnData.cards) this.columnData.cards = [];
        this.columnData.cards.push(data);
        this.disableInput()
      });
  };

  handleDeleteColumn() {
    this.deleteColumn.emit(this.columnData.id);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (
      this.showInput() &&
      this.inputNewTask &&
      !this.newTaskContainer.nativeElement.contains(event.target as Node)
    ) {
      this.showInput.set(false);
      this.newCardTitle.setValue('');
    }
  }
}
