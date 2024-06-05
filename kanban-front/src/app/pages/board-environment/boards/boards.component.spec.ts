import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardsComponent } from './boards.component';
import { BoardService } from '../../../shared/services/board.service';
import { MatDialogModule } from '@angular/material/dialog';
import { IBoard } from '../../../core/models/board';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';

describe('BoardsComponent', () => {
  let boardsComponent: BoardsComponent;
  let fixture: ComponentFixture<BoardsComponent>;

  let boardServiceMock: jasmine.SpyObj<BoardService>;

  beforeEach(async () => {
    boardServiceMock = jasmine.createSpyObj('BoardService', ['list']);

    const boards: IBoard[] = [{ _id: '1', name: 'Board 1', responsibles: []}, { _id: '2', name: 'Board 2', responsibles: []}];
  boardServiceMock.list.and.returnValue(of(boards));

    await TestBed.configureTestingModule({
      imports: [BoardsComponent, MatDialogModule, RouterModule.forRoot([])],
      providers: [
        { provide: BoardService, 
          useValue: boardServiceMock 
        },
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoardsComponent);
    boardsComponent = fixture.componentInstance;    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(boardsComponent).toBeTruthy();
  });

  it('should get boards', () => {
    const boards: IBoard[] = [{ _id: '1', name: 'Board 1', responsibles: []}, { _id: '2', name: 'Board 2', responsibles: []}];
    boardServiceMock.list.and.returnValue(of(boards));

    boardsComponent.getBoards();

    expect(boardServiceMock.list).toHaveBeenCalled();
    expect(boardsComponent.boards).toEqual(boards);
  });
});
