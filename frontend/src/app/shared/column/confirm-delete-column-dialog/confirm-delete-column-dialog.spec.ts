import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDeleteColumnDialog } from './confirm-delete-column-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';

describe('ConfirmDeleteColumnDialog', () => {
  let component: ConfirmDeleteColumnDialog;
  let fixture: ComponentFixture<ConfirmDeleteColumnDialog>;

  beforeEach(async () => {
    const dialogRefMock = {
      close: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ConfirmDeleteColumnDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: { columnName: 'Test' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDeleteColumnDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Deve fechar com true ao confirmar', () => {
    component.onConfirmDelete();
    expect(component.dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('Deve fechar com false ao cancelar', () => {
    component.onCancelDelete();
    expect(component.dialogRef.close).toHaveBeenCalledWith(false);
  });
});
