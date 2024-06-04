import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteComponent } from './delete.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('DeleteComponent', () => {
  let deleteComponent: DeleteComponent;
  let fixture: ComponentFixture<DeleteComponent>;
  let dialogRefMock: jasmine.SpyObj<MatDialogRef<DeleteComponent>>;
  let dialogDataMock: jasmine.SpyObj<MatDialogRef<DeleteComponent>>;

  beforeEach(async () => {
    dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
    dialogDataMock = jasmine.createSpyObj('MAT_DIALOG_DATA', ['']);

    await TestBed.configureTestingModule({
      imports: [DeleteComponent],
      providers: [
        { provide: MatDialogRef, 
          useValue: dialogRefMock 
        },
        { provide: MAT_DIALOG_DATA, 
          useValue: dialogDataMock 
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeleteComponent);
    deleteComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(deleteComponent).toBeTruthy();
  });

  it('should close dialog with true when confirm is called', () => {
    deleteComponent.confirm();
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('should close dialog with false when closeDialog is called', () => {
    deleteComponent.closeDialog();
    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
  });
});
