import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateColumnDialog } from './update-column-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('UpdateColumnDialog', () => {
  let component: UpdateColumnDialog;
  let fixture: ComponentFixture<UpdateColumnDialog>;

  beforeEach(async () => {
    const dialogRefMock = {
      close: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [UpdateColumnDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: { column: { id: 1, name: 'Test Column' } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateColumnDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
