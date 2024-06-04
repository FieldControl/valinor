import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBoardComponent } from './add-board.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BoardService } from '../../../shared/services/board.service';
import { UserService } from '../../../shared/services/user.service';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IBoard } from '../../../core/models/board';
import { of, throwError } from 'rxjs';

describe('AddBoardComponent - Create', () => {
  let addBoardComponent: AddBoardComponent;
  let fixture: ComponentFixture<AddBoardComponent>;
  let boardServiceMock: jasmine.SpyObj<BoardService>;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<AddBoardComponent>>;

  const mockDialogData = {
    board: {}
  };

  beforeEach(async () => {
    boardServiceMock = jasmine.createSpyObj('BoardService', ['createByMail', 'editByMail']);
    userServiceMock = jasmine.createSpyObj('UserService', ['findEmailsByIds']);
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [AddBoardComponent, ReactiveFormsModule, RouterModule.forRoot([])],
      providers: [
        { provide: BoardService, 
          useValue: boardServiceMock 
        },
        { provide: UserService, 
          useValue: userServiceMock 
        },
        { provide: MatDialogRef, 
          useValue: dialogRefMock 
        },
        { provide: MAT_DIALOG_DATA, 
          useValue: mockDialogData
        },
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddBoardComponent);
    addBoardComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(addBoardComponent).toBeTruthy();
  });

  it('should not initialize form with data', () => {
    expect(addBoardComponent.addBoardForm.value.name).toBeNull();
    expect(addBoardComponent.addBoardForm.value.responsibles).toBeNull();
  });

  it('should display error message if form is invalid on create', () => {
    const boardData: Partial<IBoard> = { name: '', responsibles: [] };
    addBoardComponent.addBoardForm.patchValue(boardData);
    addBoardComponent.createOrEditBoard();
    expect(addBoardComponent.addBoardFailed).toBeTrue();
  });

  it('should call BoardService.createByMail when form is valid on create', () => {
    const boardData: Partial<IBoard> = { name: 'New Board', responsibles: ['new@exemplo.com'] };

    addBoardComponent.addBoardForm.patchValue(boardData);
    boardServiceMock.createByMail.and.returnValue(of({ ...boardData, _id: '1234' } as IBoard));

    addBoardComponent.createOrEditBoard();

    expect(boardServiceMock.createByMail).toHaveBeenCalledWith(boardData);
    expect(dialogRefMock.close).toHaveBeenCalledWith({ ...boardData, _id: '1234' });
  });

  it('should handle error on create - no existing user', () => {
    const boardData: Partial<IBoard> = { name: 'New Board', responsibles: ['new@example.com'] };
    addBoardComponent.addBoardForm.patchValue(boardData);
    boardServiceMock.createByMail.and.returnValue(throwError(() => ({error: { message: 'Cannot read properties of null' }})));
    

    addBoardComponent.createOrEditBoard();

    expect(addBoardComponent.noExistingMail).toBeTrue();
  });

  it('should close dialog', () => {
    addBoardComponent.closeDialog();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});

describe('AddBoardComponent - Update', () => {
  let addBoardComponent: AddBoardComponent;
  let fixture: ComponentFixture<AddBoardComponent>;
  let boardServiceMock: jasmine.SpyObj<BoardService>;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<AddBoardComponent>>;

  beforeEach(async () => {
    boardServiceMock = jasmine.createSpyObj('BoardService', ['createByMail', 'editByMail']);
    userServiceMock = jasmine.createSpyObj('UserService', ['findEmailsByIds']);
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);

    const mockDialogData = {
      board: {
        _id: '123',
        name: 'Test Board',
        responsibles: ['email1@example.com', 'email2@example.com']
      }
    };

    if (mockDialogData.board._id) {
      userServiceMock.findEmailsByIds.and.returnValue(of(['email1@exemplo.com', 'email2@exemplo.com']));
    }

    await TestBed.configureTestingModule({
      imports: [AddBoardComponent, ReactiveFormsModule, RouterModule.forRoot([])],
      providers: [
        { provide: BoardService, 
          useValue: boardServiceMock 
        },
        { provide: UserService, 
          useValue: userServiceMock 
        },
        { provide: MatDialogRef, 
          useValue: dialogRefMock 
        },
        { provide: MAT_DIALOG_DATA, 
          useValue: mockDialogData
        },
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddBoardComponent);
    addBoardComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(addBoardComponent).toBeTruthy();
  });

  it('should initialize form with data', () => {
    userServiceMock.findEmailsByIds.and.returnValue(of(['email1@exemplo.com', 'email2@exemplo.com']));
    expect(addBoardComponent.addBoardForm.value.name).toBe('Test Board');
    expect(addBoardComponent.addBoardForm.value.responsibles).toEqual('email1@exemplo.com,email2@exemplo.com');
  });

  it('should display error message if form is invalid on update', () => {
    const boardData: Partial<IBoard> = { name: '', responsibles: [] };
    addBoardComponent.addBoardForm.patchValue(boardData);
    addBoardComponent.createOrEditBoard();
    expect(addBoardComponent.addBoardFailed).toBeTrue();
  });

  it('should call BoardService.updateByMail when form is valid on update', () => {
    const boardData: Partial<IBoard> = { name: 'updated Board', responsibles: ['updated@exemplo.com'] };

    addBoardComponent.addBoardForm.patchValue(boardData);
    boardServiceMock.editByMail.and.returnValue(of({ ...boardData, _id: '123' } as IBoard));

    addBoardComponent.createOrEditBoard();

    expect(boardServiceMock.editByMail).toHaveBeenCalledWith('123', boardData);
    expect(dialogRefMock.close).toHaveBeenCalledWith({ ...boardData, _id: '123' });
  });

  it('should handle error on update - no existing user', () => {
    const boardData: Partial<IBoard> = { name: 'Updated Board', responsibles: ['updated@example.com'] };
    addBoardComponent.addBoardForm.patchValue(boardData);
    boardServiceMock.editByMail.and.returnValue(throwError(() => ({error: { message: 'Cannot read properties of null' }})));

    addBoardComponent.createOrEditBoard();

    expect(addBoardComponent.noExistingMail).toBeTrue();
  });

  it('should close dialog', () => {
    addBoardComponent.closeDialog();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});
