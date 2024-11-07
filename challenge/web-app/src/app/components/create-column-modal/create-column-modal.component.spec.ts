import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { CreateColumnModalComponent } from './create-column-modal.component';
import { ColumnService } from '../../services/column.service';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('CreateColumnModalComponent', () => {
  let component: CreateColumnModalComponent;
  let fixture: ComponentFixture<CreateColumnModalComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<CreateColumnModalComponent>>;
  let mockColumnService: jasmine.SpyObj<ColumnService>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockColumnService = jasmine.createSpyObj('ColumnService', ['createColumn']);

    await TestBed.configureTestingModule({
      imports: [CreateColumnModalComponent, FormsModule, BrowserAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: ColumnService, useValue: mockColumnService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateColumnModalComponent);
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

  it('should call createColumn and close dialog on save', () => {
    component.columnName = 'Test'

    component.onSave();

    expect(mockColumnService.createColumn).toHaveBeenCalledWith({
      name: 'Test'
    });

    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
