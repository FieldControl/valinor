import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddColumnComponent } from './add-column.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ColumnService } from '../../../shared/services/column.service';
import { IColumn } from '../../../core/models/column';
import { of } from 'rxjs';

describe('AddColumnComponent - Create', () => {
  let addColumnComponent: AddColumnComponent;
  let fixture: ComponentFixture<AddColumnComponent>;
  let columnServiceMock: jasmine.SpyObj<ColumnService>;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<AddColumnComponent>>;

  const mockDialogData = {
    board: {}
  };

  beforeEach(async () => {
    columnServiceMock = jasmine.createSpyObj('ColumnService', ['create', 'edit']);
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [AddColumnComponent, ReactiveFormsModule, RouterModule.forRoot([])],
      providers: [
        { provide: ColumnService, 
          useValue: columnServiceMock 
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
    
    fixture = TestBed.createComponent(AddColumnComponent);
    addColumnComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(addColumnComponent).toBeTruthy();
  });

  it('should not initialize form with data', () => {
    expect(addColumnComponent.addColumnForm.value.name).toBeNull();
  });

  it('should display error message if form is invalid on create', () => {
    const columnData: Partial<IColumn> = { name: '' };
    addColumnComponent.addColumnForm.patchValue(columnData);
    addColumnComponent.createOrEditColumn();
    expect(addColumnComponent.addColumnFailed).toBeTrue();
  });

  it('should call ColumnService.create when form is valid on create', () => {
    const columnData: Partial<IColumn> = { name: 'New Board' };

    addColumnComponent.addColumnForm.patchValue(columnData);
    columnServiceMock.create.and.returnValue(of({ ...columnData, _id: '1234', board: 'boardId' } as IColumn));

    addColumnComponent.createOrEditColumn();

    expect(columnServiceMock.create).toHaveBeenCalledWith({
      ...columnData,
      board: addColumnComponent.boardId
    });
    expect(dialogRefMock.close).toHaveBeenCalledWith({ ...columnData, _id: '1234', board: 'boardId' });
  });

  it('should close dialog', () => {
    addColumnComponent.closeDialog();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});

describe('AddColumnComponent - Update', () => {
  let addColumnComponent: AddColumnComponent;
  let fixture: ComponentFixture<AddColumnComponent>;
  let columnServiceMock: jasmine.SpyObj<ColumnService>;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<AddColumnComponent>>;

  const mockDialogData = {
    column: {
      _id: '123',
      name: 'Test Column',
      board: 'boardId'
    }
  };

  beforeEach(async () => {
    columnServiceMock = jasmine.createSpyObj('ColumnService', ['create', 'edit']);
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [AddColumnComponent, ReactiveFormsModule, RouterModule.forRoot([])],
      providers: [
        { provide: ColumnService, 
          useValue: columnServiceMock 
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
    
    fixture = TestBed.createComponent(AddColumnComponent);
    addColumnComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(addColumnComponent).toBeTruthy();
  });

  it('should initialize form with data', () => {
    expect(addColumnComponent.addColumnForm.value.name).toBe('Test Column');
  });

  it('should display error message if form is invalid on update', () => {
    const columnData: Partial<IColumn> = { name: '' };
    addColumnComponent.addColumnForm.patchValue(columnData);
    addColumnComponent.createOrEditColumn();
    expect(addColumnComponent.addColumnFailed).toBeTrue();
  });

  it('should call ColumnService.edit when form is valid on update', () => {
    const columnData: Partial<IColumn> = { name: 'Updated Board' };

    addColumnComponent.addColumnForm.patchValue(columnData);
    columnServiceMock.edit.and.returnValue(of({ ...columnData, _id: '1234' } as IColumn));

    addColumnComponent.createOrEditColumn();

    expect(columnServiceMock.edit).toHaveBeenCalledWith('123', columnData);
    expect(dialogRefMock.close).toHaveBeenCalledWith({ ...columnData, _id: '1234' });
  });

  it('should close dialog', () => {
    addColumnComponent.closeDialog();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});
