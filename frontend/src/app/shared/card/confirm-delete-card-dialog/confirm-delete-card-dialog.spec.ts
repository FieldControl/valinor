import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDeleteCardDialog } from './confirm-delete-card-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('ConfirmDeleteCardDialog', () => {
  let component: ConfirmDeleteCardDialog;
  let fixture: ComponentFixture<ConfirmDeleteCardDialog>;

  beforeEach(async () => {
    const dialogRefMock = {
      close: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [ConfirmDeleteCardDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: { cardTitle: 'Test' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDeleteCardDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
