import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CreateCardModalComponent } from './create-card-modal.component';
import { CardService } from '../../services/card.service';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('CreateCardModalComponent', () => {
  let component: CreateCardModalComponent;
  let fixture: ComponentFixture<CreateCardModalComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<CreateCardModalComponent>>;
  let mockCardService: jasmine.SpyObj<CardService>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockCardService = jasmine.createSpyObj('CardService', ['createCard']);

    await TestBed.configureTestingModule({
      imports: [CreateCardModalComponent, FormsModule, BrowserAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { column: { id: 1, name: 'Test' } } },
        { provide: CardService, useValue: mockCardService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateCardModalComponent);
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

  it('should call createCard and close dialog on save', () => {
    component.title = 'Test';
    component.description = 'Test';

    component.onSave();

    expect(mockCardService.createCard).toHaveBeenCalledWith({
      columnId: 1,
      title: 'Test',
      description: 'Test',
    });

    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
