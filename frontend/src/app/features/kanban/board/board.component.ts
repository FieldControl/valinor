import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  signal,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { BoardHeaderComponent } from '@shared/components/layout/header/header.component';
import { UiButtonComponent } from '@shared/components/ui/ui-button/ui-button.component';
import { UiInputComponent } from '@shared/components/ui/ui-input/ui-input.component';
import { IconPlus } from '@shared/icons/plus.component';
import { Cards, Columns } from '@type/types';
import { ChatbotComponent } from '../chatbot/chatbot.component';
import { ColumnComponent } from '../column/column.component';
import { BoardService } from './board.service';



@Component({
  selector: 'app-board',
  imports: [
    BoardHeaderComponent,
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    ColumnComponent,
    UiInputComponent,
    UiButtonComponent,
    IconPlus,
    ChatbotComponent,

  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
})
export class BoardComponent {
  @ViewChild(UiInputComponent) inputNewList!: UiInputComponent;
  @ViewChild('newListContainer') newListContainer!: ElementRef<HTMLDivElement>;

  columns = signal<Columns[]>([]);
  showInput = signal(false);
  newColumnTitle = new FormControl('');

  constructor(private boardService: BoardService) { }

  ngOnInit() {
    this.getBoardData()
  }

  getBoardData() {
    this.boardService.getColsWithCards().subscribe({
      next: (data) => { this.columns.set(data) },
      error: (error) => console.log(error),
    });
  }

  enableInput = () => {
    this.showInput.set(true);
  };

  addNewColumn() {
    if (this.newColumnTitle.value) {
      this.boardService.createColumn(this.newColumnTitle.value)
        .subscribe((newColumn) => {
          this.columns.update(cols => [...cols, newColumn]);
          this.newColumnTitle.setValue('');
          this.showInput.set(false);
        });
    }
  }

  deleteColumn(columnId: string) {
    this.boardService.delete(columnId).subscribe({
      next: () => {
        this.columns.update(cols => cols.filter(c => c.id !== columnId));
      },
      error: (err) => console.error(err)
    });
  }

  // Drag and Drop
  dropColumn(event: CdkDragDrop<Columns[]>) {
    moveItemInArray(this.columns(), event.previousIndex, event.currentIndex);
  }

  dropCard(event: CdkDragDrop<Cards[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (
      this.showInput() &&
      this.inputNewList &&
      !this.newListContainer.nativeElement.contains(event.target as Node)
    ) {
      this.showInput.set(false);
      this.newColumnTitle.setValue('');
    }
  }
}
