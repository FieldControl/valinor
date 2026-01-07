import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BoardService, Board, Column } from './board-service';

describe('BoardService', () => {
  let service: BoardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BoardService]
    });
    service = TestBed.inject(BoardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('findAllUserBoards', () => {
    it('should fetch all user boards', () => {
      const mockBoards: Board[] = [
        { id: 1, name: 'Board 1', createdAt: '2023-01-01' },
        { id: 2, name: 'Board 2', createdAt: '2023-01-02' }
      ];
      const mockResponse = {
        data: { myBoards: mockBoards }
      };

      service.findAllUserBoards().subscribe(response => {
        expect(response.data.myBoards).toEqual(mockBoards);
        expect(response.data.myBoards.length).toBe(2);
      });

      const req = httpMock.expectOne('http://localhost:3000/graphql');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('createBoard', () => {
    it('should create a new board', () => {
      const boardName = 'New Board';
      const mockBoard: Board = { id: 1, name: boardName, createdAt: '2023-01-01' };
      const mockResponse = {
        data: { createBoard: mockBoard }
      };

      service.createBoard(boardName).subscribe(response => {
        expect(response.data.createBoard).toEqual(mockBoard);
        expect(response.data.createBoard.name).toBe(boardName);
      });

      const req = httpMock.expectOne('http://localhost:3000/graphql');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.variables.createBoardInput.name).toBe(boardName);
      req.flush(mockResponse);
    });
  });

  describe('getBoardWithColumns', () => {
    it('should fetch a board with its columns', () => {
      const boardId = 1;
      const mockColumns: Column[] = [
        { id: 1, name: 'To Do', boardId: 1, cards: [] },
        { id: 2, name: 'In Progress', boardId: 1, cards: [] }
      ];
      const mockResponse = {
        data: {
          getBoard: {
            id: boardId,
            name: 'Test Board',
            createdAt: '2023-01-01',
            columns: mockColumns
          }
        }
      };

      service.getBoardWithColumns(boardId).subscribe(response => {
        expect(response.data.getBoard.id).toBe(boardId);
        expect(response.data.getBoard.columns.length).toBe(2);
        expect(response.data.getBoard.columns).toEqual(mockColumns);
      });

      const req = httpMock.expectOne('http://localhost:3000/graphql');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('getBoardUsers', () => {
    it('should fetch users of a board', () => {
      const boardId = 1;
      const mockUsers = [
        { id: 1, name: 'User 1', email: 'user1@example.com' },
        { id: 2, name: 'User 2', email: 'user2@example.com' }
      ];
      const mockResponse = {
        data: { getBoardUsers: mockUsers }
      };

      service.getBoardUsers(boardId).subscribe(response => {
        expect(response.data.getBoardUsers).toEqual(mockUsers);
        expect(response.data.getBoardUsers.length).toBe(2);
      });

      const req = httpMock.expectOne('http://localhost:3000/graphql');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('addUserToBoard', () => {
    it('should add a user to a board', () => {
      const boardId = 1;
      const userEmail = 'newuser@example.com';
      const mockUser = { id: 3, name: 'New User', email: userEmail };
      const mockResponse = {
        data: { addUserToBoard: mockUser }
      };

      service.addUserToBoard(boardId, userEmail).subscribe(response => {
        expect(response.data.addUserToBoard).toEqual(mockUser);
      });

      const req = httpMock.expectOne('http://localhost:3000/graphql');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.variables.addUserToBoardInput).toEqual({
        boardId,
        email: userEmail
      });
      req.flush(mockResponse);
    });
  });
});
