import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateColumnDialog } from './create-column-dialog';
import { MatDialogRef } from '@angular/material/dialog';

describe('CreateColumnDialog', () => {
  let component: CreateColumnDialog;
  let fixture: ComponentFixture<CreateColumnDialog>;

  beforeEach(async () => {
    const dialogRefMock = {
      close: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [CreateColumnDialog],
      providers: [{ provide: MatDialogRef, useValue: dialogRefMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateColumnDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
