import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UpdateCardDialog } from './update-card-dialog';

describe('UpdateCardDialog', () => {
  let component!: UpdateCardDialog;
  let fixture!: ComponentFixture<UpdateCardDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateCardDialog],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            close: vi.fn(),
          },
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            card: {
              id: 1,
              name: 'Card teste',
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateCardDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
