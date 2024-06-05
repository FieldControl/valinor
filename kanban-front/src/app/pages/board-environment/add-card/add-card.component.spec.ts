import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCardComponent } from './add-card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CardService } from '../../../shared/services/card.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ICard } from '../../../core/models/card';
import { of } from 'rxjs';

const fixedDate = new Date('2024-06-04T17:00:00Z');

describe('AddCardComponent - Create', () => {
  let addCardComponent: AddCardComponent;
  let fixture: ComponentFixture<AddCardComponent>;
  let cardServiceMock: jasmine.SpyObj<CardService>;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<AddCardComponent>>;

  const mockDialogData = {
    card: {}
  };

  beforeEach(async () => {
    cardServiceMock = jasmine.createSpyObj('CardService', ['create', 'edit']);
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [AddCardComponent, ReactiveFormsModule],
      providers: [
        { provide: CardService, 
          useValue: cardServiceMock 
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
    
    fixture = TestBed.createComponent(AddCardComponent);
    addCardComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(addCardComponent).toBeTruthy();
  });

  it('should not initialize form with data', () => {
    expect(addCardComponent.addCardForm.value.name).toBeNull();
    expect(addCardComponent.addCardForm.value.description).toBeNull();
    expect(addCardComponent.addCardForm.value.dueDate).toBeNull();
  });

  it('should display error message if form is invalid on create', () => {
    const cardData: Partial<ICard> = { 
      name: '', 
      description: '', 
      dueDate: new Date(),
    };

    addCardComponent.addCardForm.patchValue(cardData);
    addCardComponent.createOrEditCard();
    expect(addCardComponent.addCardFailed).toBeTrue();
  });

  it('should call CardService.create when form is valid on create', () => {
    const cardData: Partial<ICard> = { 
    name: 'Test Card', 
    description: 'Test description', 
    dueDate: fixedDate,
  };

    addCardComponent.addCardForm.patchValue(cardData);

    cardServiceMock.create.and.returnValue(of({
      ...cardData, 
      _id: '1234',
      createdAt: fixedDate,
      responsibles: [],
      column: '123',
      columnName: 'test',
      position: 1, } as ICard));

    addCardComponent.createOrEditCard();

    expect(cardServiceMock.create).toHaveBeenCalledWith({
      ...cardData,
      column: addCardComponent.columnId
    });
    expect(dialogRefMock.close).toHaveBeenCalledWith({ 
      ...cardData, 
      _id: '1234',
      createdAt: fixedDate,
      responsibles: [],
      column: '123',
      columnName: 'test',
      position: 1, });
  });

  it('should close dialog', () => {
    addCardComponent.closeDialog();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});

describe('AddCardComponent - Update', () => {
  let addCardComponent: AddCardComponent;
  let fixture: ComponentFixture<AddCardComponent>;
  let cardServiceMock: jasmine.SpyObj<CardService>;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<AddCardComponent>>;

  const mockDialogData = {
    card: {
      _id: '123',
      name: 'Test Card',
      description: 'Test description',
      dueDate: fixedDate
    }
  };

  beforeEach(async () => {
    cardServiceMock = jasmine.createSpyObj('CardService', ['create', 'edit']);
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [AddCardComponent, ReactiveFormsModule],
      providers: [
        { provide: CardService, 
          useValue: cardServiceMock 
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
    
    fixture = TestBed.createComponent(AddCardComponent);
    addCardComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(addCardComponent).toBeTruthy();
  });

  it('should initialize form with data', () => {
    expect(addCardComponent.addCardForm.value.name).toBe('Test Card');
    expect(addCardComponent.addCardForm.value.description).toBe('Test description');
    expect(addCardComponent.addCardForm.value.dueDate).toEqual(fixedDate);
  });

  it('should display error message if form is invalid on update', () => {
    const cardData: Partial<ICard> = { 
      name: '', 
      description: '', 
      dueDate: new Date(),
    };

    addCardComponent.addCardForm.patchValue(cardData);
    addCardComponent.createOrEditCard();
    expect(addCardComponent.addCardFailed).toBeTrue();
  });

  it('should call CardService.edit when form is valid on update', () => {
    const cardData: Partial<ICard> = { 
    name: 'Updated Card', 
    description: 'Updated description', 
    dueDate: fixedDate,
  };

    addCardComponent.addCardForm.patchValue(cardData);

    cardServiceMock.edit.and.returnValue(of({
      ...cardData, 
      _id: '1234',
      createdAt: fixedDate,
      responsibles: [],
      column: '123',
      columnName: 'test',
      position: 1, } as ICard));

    addCardComponent.createOrEditCard();

    expect(cardServiceMock.edit).toHaveBeenCalledWith('123', {
      ...cardData,
    });
    expect(dialogRefMock.close).toHaveBeenCalledWith({ 
      ...cardData, 
      _id: '1234',
      createdAt: fixedDate,
      responsibles: [],
      column: '123',
      columnName: 'test',
      position: 1, });
  });

  it('should close dialog', () => {
    addCardComponent.closeDialog();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});
