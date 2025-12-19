import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Board } from './board';
import { BoardService } from '../service/board/board-service';
import { ColumnService } from '../service/column/column-service';
import { CardService } from '../service/card/card-service';

describe('Board', () => {
  let component: Board;
  let fixture: ComponentFixture<Board>;
  let boardService: jasmine.SpyObj<BoardService>;
  let columnService: jasmine.SpyObj<ColumnService>;
  let cardService: jasmine.SpyObj<CardService>;

  beforeEach(async () => {
    const boardServiceSpy = jasmine.createSpyObj('BoardService', [
      'findAllUserBoards',
      'createBoard',
      'getBoardWithColumns',
      'getBoardUsers',
      'addUserToBoard'
    ]);
    const columnServiceSpy = jasmine.createSpyObj('ColumnService', [
      'createColumn',
      'updateColumn',
      'deleteColumn'
    ]);
    const cardServiceSpy = jasmine.createSpyObj('CardService', [
      'createCard',
      'updateCard',
      'deleteCard',
      'moveCard'
    ]);

    await TestBed.configureTestingModule({
      imports: [Board, HttpClientTestingModule, FormsModule],
      providers: [
        { provide: BoardService, useValue: boardServiceSpy },
        { provide: ColumnService, useValue: columnServiceSpy },
        { provide: CardService, useValue: cardServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Board);
    component = fixture.componentInstance;
    boardService = TestBed.inject(BoardService) as jasmine.SpyObj<BoardService>;
    columnService = TestBed.inject(ColumnService) as jasmine.SpyObj<ColumnService>;
    cardService = TestBed.inject(CardService) as jasmine.SpyObj<CardService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load boards on init', () => {
      const mockBoards = [
        { id: 1, name: 'Board 1', createdAt: '2023-01-01' },
        { id: 2, name: 'Board 2', createdAt: '2023-01-02' }
      ];
      const mockResponse = { data: { myBoards: mockBoards } };

      boardService.findAllUserBoards.and.returnValue(of(mockResponse));
      boardService.getBoardWithColumns.and.returnValue(of({
        data: {
          getBoard: {
            id: 1,
            name: 'Board 1',
            createdAt: '2023-01-01',
            columns: []
          }
        }
      }));
      boardService.getBoardUsers.and.returnValue(of({ data: { getBoardUsers: [] } }));

      component.ngOnInit();

      expect(boardService.findAllUserBoards).toHaveBeenCalled();
      expect(component.boards).toEqual(mockBoards);
      expect(component.hasBoards).toBe(true);
      expect(component.selectedBoardId).toBe(1);
    });

    it('should handle empty boards', () => {
      const mockResponse = { data: { myBoards: [] } };
      boardService.findAllUserBoards.and.returnValue(of(mockResponse));

      component.ngOnInit();

      expect(component.boards).toEqual([]);
      expect(component.hasBoards).toBe(false);
      expect(component.isLoading).toBe(false);
    });

    it('should handle error loading boards', () => {
      spyOn(console, 'error');
      boardService.findAllUserBoards.and.returnValue(
        throwError(() => new Error('Failed to load boards'))
      );

      component.ngOnInit();

      expect(console.error).toHaveBeenCalled();
      expect(component.boards).toEqual([]);
      expect(component.hasBoards).toBe(false);
    });
  });

  describe('createBoard', () => {
    it('should create a new board successfully', () => {
      const newBoardName = 'New Board';
      component.newBoardName = newBoardName;
      component.boards = [];

      const mockResponse = {
        data: {
          createBoard: {
            id: 3,
            name: newBoardName,
            createdAt: '2023-01-03'
          }
        }
      };

      boardService.createBoard.and.returnValue(of(mockResponse));
      boardService.getBoardWithColumns.and.returnValue(of({ data: { getBoard: { id: 3, name: newBoardName, createdAt: '2023-01-03', columns: [] } } }));
      boardService.getBoardUsers.and.returnValue(of({ data: { getBoardUsers: [] } }));

      component.createBoard();

      expect(boardService.createBoard).toHaveBeenCalledWith(newBoardName);
      expect(component.boards.length).toBe(1);
      expect(component.showCreateBoardModal).toBe(false);
    });

    it('should handle create board error', () => {
      spyOn(console, 'error');
      component.newBoardName = 'New Board';

      boardService.createBoard.and.returnValue(
        throwError(() => new Error('Failed to create board'))
      );

      component.createBoard();

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('selectBoard', () => {
    it('should select a board and load its data', () => {
      const boardId = 2;
      const mockResponse = {
        data: {
          getBoard: {
            id: boardId,
            name: 'Board 2',
            createdAt: '2023-01-02',
            columns: [
              { id: 1, name: 'To Do', boardId: 2, cards: [] }
            ]
          }
        }
      };

      boardService.getBoardWithColumns.and.returnValue(of(mockResponse));
      boardService.getBoardUsers.and.returnValue(of({ data: { getBoardUsers: [] } }));

      component.selectBoard(boardId);

      expect(component.selectedBoardId).toBe(boardId);
      expect(boardService.getBoardWithColumns).toHaveBeenCalledWith(boardId);
      expect(component.columns.length).toBe(1);
    });
  });

  describe('createColumn', () => {
    it('should create a new column', () => {
      component.selectedBoardId = 1;
      component.newColumnName = 'In Progress';

      const mockResponse = {
        data: {
          createColumn: {
            id: 2,
            name: 'In Progress',
            boardId: 1,
            position: 2
          }
        }
      };

      columnService.createColumn.and.returnValue(of(mockResponse));
      boardService.getBoardWithColumns.and.returnValue(of({ data: { getBoard: { id: 1, name: 'Board 1', createdAt: '2023-01-01', columns: [] } } }));
      boardService.getBoardUsers.and.returnValue(of({ data: { getBoardUsers: [] } }));

      component.createColumn();

      expect(columnService.createColumn).toHaveBeenCalled();
      expect(component.showCreateColumnModal).toBe(false);
    });
  });

  describe('createCard', () => {
    it('should create a new card in a column', () => {
      component.selectedColumnId = 1;
      component.newCardName = 'New Task';
      component.newCardDescription = 'Task Description';

      const mockResponse = {
        data: {
          createCard: {
            id: 1,
            name: 'New Task',
            description: 'Task Description',
            columnId: 1
          }
        }
      };

      cardService.createCard.and.returnValue(of(mockResponse));
      boardService.getBoardWithColumns.and.returnValue(of({ data: { getBoard: { id: 1, name: 'Board 1', createdAt: '2023-01-01', columns: [] } } }));
      boardService.getBoardUsers.and.returnValue(of({ data: { getBoardUsers: [] } }));
      component.selectedBoardId = 1;

      component.createCard();

      expect(cardService.createCard).toHaveBeenCalled();
      expect(component.showCreateCardModal).toBe(false);
    });
  });

  describe('drag and drop', () => {
    it('should set dragged card on drag start', () => {
      const cardId = 1;
      const columnId = 2;
      const mockEvent = new DragEvent('dragstart');

      component.onDragStart(mockEvent, cardId, columnId);

      expect(component.draggedCardId).toBe(cardId);
      expect(component.draggedFromColumnId).toBe(columnId);
    });

    it('should move card on drop', () => {
      component.draggedCardId = 1;
      component.draggedFromColumnId = 2;
      const newColumnId = 3;
      component.selectedBoardId = 1;
      
      // Setup columns with cards
      component.columns = [
        { id: 2, name: 'Column 1', boardId: 1, cards: [{ id: 1, name: 'Test Card', columnId: 2 }] },
        { id: 3, name: 'Column 2', boardId: 1, cards: [] }
      ];

      const mockResponse = {
        data: {
          moveCard: {
            id: 1,
            name: 'Test Card',
            columnId: newColumnId
          }
        }
      };

      cardService.moveCard.and.returnValue(of(mockResponse));
      boardService.getBoardWithColumns.and.returnValue(of({ data: { getBoard: { id: 1, name: 'Board 1', createdAt: '2023-01-01', columns: [] } } }));
      boardService.getBoardUsers.and.returnValue(of({ data: { getBoardUsers: [] } }));
      const mockEvent = new DragEvent('drop');

      component.onDrop(mockEvent, newColumnId);

      expect(cardService.moveCard).toHaveBeenCalledWith(1, newColumnId);
      expect(component.draggedCardId).toBeNull();
    });
  });

  describe('modal controls', () => {
    it('should open create board modal', () => {
      component.openCreateBoardModal();
      expect(component.showCreateBoardModal).toBe(true);
    });

    it('should close create board modal', () => {
      component.closeCreateBoardModal();
      expect(component.showCreateBoardModal).toBe(false);
      expect(component.newBoardName).toBe('');
    });

    it('should open create column modal', () => {
      component.openCreateColumnModal();
      expect(component.showCreateColumnModal).toBe(true);
    });

    it('should open create card modal', () => {
      const columnId = 1;
      component.openCreateCardModal(columnId);
      expect(component.showCreateCardModal).toBe(true);
      expect(component.selectedColumnId).toBe(columnId);
    });
  });
});

