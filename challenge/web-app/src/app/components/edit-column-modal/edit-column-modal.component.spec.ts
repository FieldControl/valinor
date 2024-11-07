import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditColumnModalComponent } from './edit-column-modal.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ColumnService } from '../../services/column.service';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EditColumnModalComponent', () => {
  let component: EditColumnModalComponent;
  let fixture: ComponentFixture<EditColumnModalComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<EditColumnModalComponent>>;
  let mockColumnService: jasmine.SpyObj<ColumnService>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockColumnService = jasmine.createSpyObj('ColumnService', ['editColumn']);

    await TestBed.configureTestingModule({
      imports: [EditColumnModalComponent, FormsModule, BrowserAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { column: { id: 1, name: 'Test' } } },
        { provide: ColumnService, useValue: mockColumnService },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditColumnModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog on cancel', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should call editColumn and close dialog on save', () => {
    component.columnName = 'Test';

    component.onSave();

    expect(mockColumnService.editColumn).toHaveBeenCalledWith(1, {
      name: 'Test'
    });

    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
