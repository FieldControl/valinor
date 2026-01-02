import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCardDialog } from './create-card-dialog';
import { MatDialogRef } from '@angular/material/dialog';

describe('CreateCardDialog', () => {
  let component: CreateCardDialog;
  let fixture: ComponentFixture<CreateCardDialog>;

  beforeEach(async () => {
    const dialogRefMock = {
      close: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [CreateCardDialog],
      providers: [{ provide: MatDialogRef, useValue: dialogRefMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateCardDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
