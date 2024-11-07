import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCardModalComponent } from './edit-card-modal.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CardService } from '../../services/card.service';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EditCardModalComponent', () => {
  let component: EditCardModalComponent;
  let fixture: ComponentFixture<EditCardModalComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<EditCardModalComponent>>;
  let mockCardService: jasmine.SpyObj<CardService>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockCardService = jasmine.createSpyObj('CardService', ['editCard']);

    await TestBed.configureTestingModule({
      imports: [EditCardModalComponent, FormsModule, BrowserAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { card: { id: 1, columnId: 1, title: 'Test', description: 'Test' } } },
        { provide: CardService, useValue: mockCardService },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCardModalComponent);
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

  it('should call editCard and close dialog on save', () => {
    component.title = 'Test';
    component.description = 'Test';

    component.onSave();

    expect(mockCardService.editCard).toHaveBeenCalledWith(1, {
      columnId: 1,
      title: 'Test',
      description: 'Test',
    });

    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
