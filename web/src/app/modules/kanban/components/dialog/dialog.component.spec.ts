import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { CardsResponse } from 'src/app/models/interface/card/response/CardsResponse';
import { CreateColumnRequest } from 'src/app/models/interface/column/request/CreateColumnRequest';
import { CardService } from 'src/app/service/card/card.service';
import { ColumnService } from 'src/app/service/column/column.service';
import { UserService } from 'src/app/service/user/user.service';
import { DialogComponent } from './dialog.component';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;
  let cardServiceSpy: jasmine.SpyObj<CardService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let columnServiceSpy: jasmine.SpyObj<ColumnService>;
  let dialogRefSpy: jasmine.SpyObj<DynamicDialogRef>;

  beforeEach(async () => {
    const cardServiceSpyObj = jasmine.createSpyObj('CardService', [
      'createCard',
      'editCard',
      'editUserToCard',
      'editColumnToCard',
    ]);

    const userServiceSpyObj = jasmine.createSpyObj('UserService', [
      'getAllUsers',
    ]);

    const columnServiceSpyObj = jasmine.createSpyObj('ColumnService', [
      'createColumn',
      'editColumn',
    ]);

    dialogRefSpy = jasmine.createSpyObj('DynamicDialogRef', ['close']);

    await TestBed.configureTestingModule({
      declarations: [DialogComponent],
      providers: [
        FormBuilder,
        { provide: CardService, useValue: cardServiceSpyObj },
        { provide: UserService, useValue: userServiceSpyObj },
        { provide: ColumnService, useValue: columnServiceSpyObj },
        { provide: DynamicDialogRef, useValue: dialogRefSpy },
        {
          provide: DynamicDialogConfig,
          useValue: { data: { event: { action: 'addCardEvent' } } },
        },
      ],
    }).compileComponents();

    cardServiceSpy = TestBed.inject(CardService) as jasmine.SpyObj<CardService>;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    columnServiceSpy = TestBed.inject(
      ColumnService
    ) as jasmine.SpyObj<ColumnService>;

    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call createCard method when handleSubmitAddCard is called', () => {
    const formMock = {
      title: 'new title',
      description: 'new description',
      responsable: '1',
    };

    component.userDatas = [
      { id: '1', name: 'User 1' },
      { id: '2', name: 'User 2' },
    ];

    const request = {
      title: 'new title',
      description: 'new description',
      user: '1',
      column: '1',
    };

    const mockResponse: CardsResponse = {
      id: '1',
      title: 'new title',
      description: 'new description',
      user: {
        id: '1',
        name: 'John Doe',
      },
      columnsTable: {
        id: '1',
      },
    };

    cardServiceSpy.createCard.and.returnValue(of(mockResponse));
    component.dialogAction.event.id = '1';

    component.addCardForm.setValue(formMock);
    component.handleSubmitAddCard();

    expect(cardServiceSpy.createCard).toHaveBeenCalledWith(request);
    cardServiceSpy.createCard(request).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });
  });

  it('should call createColumn method when handleSubmitAddColumn is called', () => {
    const mockRequest: CreateColumnRequest = {
      title: 'new column',
    };

    const response = {
      id: '1',
      title: 'new column',
    };

    columnServiceSpy.createColumn.and.returnValue(of(response));

    component.columnForm.setValue(mockRequest);
    component.handleSubmitAddColumn();

    expect(columnServiceSpy.createColumn).toHaveBeenCalledWith(mockRequest);
    columnServiceSpy.createColumn(mockRequest).subscribe((response) => {
      expect(response).toEqual(response);
    });
  });

  it('should call editColumn method when handleSubmitEditColumn is called', () => {
    const formMock = {
      title: 'update column',
    };

    const request = {
      id: '1',
      title: 'update column',
    };

    const mockResponse = {
      id: '1',
      title: 'update column',
    };

    columnServiceSpy.editColumn.and.returnValue(of(mockResponse));
    component.dialogAction.event.id = '1';

    component.columnForm.setValue(formMock);
    component.handleSubmitEditColumn();

    expect(columnServiceSpy.editColumn).toHaveBeenCalledWith(mockResponse);
    columnServiceSpy.editColumn(request).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });
  });

  it('should call editCard method when handleSubmitEditCard is called', () => {
    const formMock = {
      title: 'update column',
      description: 'update description',
      responsable: '1',
    };

    const request = {
      id: '1',
      title: 'update column',
      description: 'update description',
    };

    const mockResponse = {
      id: '1',
      title: 'new card',
      description: 'new description',
      user: {
        id: '1',
        name: 'John Doe',
      },
      columnsTable: {
        id: '1',
      },
    };

    cardServiceSpy.editCard.and.returnValue(of(mockResponse));
    component.dialogAction.event.id = '1';
    component.card = mockResponse;

    component.editCardForm.setValue(formMock);
    component.handleSubmitEditCard();

    expect(cardServiceSpy.editCard).toHaveBeenCalledWith(request);
    cardServiceSpy.editCard(request).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });
  });

  it('should call editCardToColumn method when handleSubmitEditCardToColumn is called', () => {
    const mockForm = {
      column: '1',
    };

    const request = {
      id: '1',
      column: '1',
    };

    const mockResponse = {
      id: '1',
      title: 'new card',
      description: 'new description',
      user: {
        id: '1',
        name: 'John Doe',
      },
      columnsTable: {
        id: '1',
      },
    };

    cardServiceSpy.editColumnToCard.and.returnValue(of(mockResponse));
    component.dialogAction.event.id = '1';

    component.editColumnToCardForm.setValue(mockForm);
    component.handleEditColumnToCard();

    expect(cardServiceSpy.editColumnToCard).toHaveBeenCalledWith(request);
    cardServiceSpy.editColumnToCard(request).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });
  });
});
