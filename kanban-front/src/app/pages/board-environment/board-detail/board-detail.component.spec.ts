import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardDetailComponent } from './board-detail.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BoardService } from '../../../shared/services/board.service';
import { CardService } from '../../../shared/services/card.service';
import { ColumnService } from '../../../shared/services/column.service';
import { CdkDropListGroup, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { IColumn } from '../../../core/models/column';
import { IBoard } from '../../../core/models/board';
import { AddColumnComponent } from '../add-column/add-column.component';

describe('BoardDetailComponent', () => {
  let boardDetailComponent: BoardDetailComponent;
  let fixture: ComponentFixture<BoardDetailComponent>;

  let boardServiceMock: jasmine.SpyObj<BoardService>;
  let columnServiceMock: jasmine.SpyObj<ColumnService>;
  let cardServiceMock: jasmine.SpyObj<CardService>;
  let dialogMock: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    boardServiceMock = jasmine.createSpyObj('BoardService', ['findById']);
    columnServiceMock = jasmine.createSpyObj('ColumnService', ['findByBoard']);
    cardServiceMock = jasmine.createSpyObj('CardService', ['updatePosition', 'move']);
    dialogMock = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [BoardDetailComponent, CdkDropListGroup, CdkDropList, CdkDrag, MatDialogModule, RouterModule.forRoot([])],
      providers: [
        { provide: BoardService, 
          useValue: boardServiceMock 
        },
        { provide: ColumnService, 
          useValue: columnServiceMock 
        },
        { provide: CardService, 
          useValue: cardServiceMock 
        },
        { provide: MatDialog, 
          useValue: dialogMock 
        },
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoardDetailComponent);
    boardDetailComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(boardDetailComponent).toBeTruthy();
  });

  it('should get columns when board id is provided', () => {
    const boardId = '123';
    const columns: IColumn[] = [{ _id: '1', name: 'Column 1', cards: [], board: '123' }, { _id: '2', name: 'Column 2', cards: [], board: '123' }];
    columnServiceMock.findByBoard.and.returnValue(of(columns));

    boardDetailComponent.getColumns(boardId);

    expect(columnServiceMock.findByBoard).toHaveBeenCalledWith(boardId);
    expect(boardDetailComponent.columns).toEqual(columns);
  });

  it('should get board details when board id is provided', () => {
    const boardId = '123';
    const board: IBoard = { _id: '123', name: 'Board 1', responsibles: [] };
    boardServiceMock.findById.and.returnValue(of(board));

    boardDetailComponent.boardId = boardId;
    boardDetailComponent.getBoard();

    expect(boardServiceMock.findById).toHaveBeenCalledWith(boardId);
    expect(boardDetailComponent.board).toEqual(board);
  });
});
