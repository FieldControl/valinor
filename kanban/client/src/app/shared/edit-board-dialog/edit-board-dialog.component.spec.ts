import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBoardDialogComponent } from './edit-board-dialog.component';

describe('EditBoardDialogComponent', () => {
  let component: EditBoardDialogComponent;
  let fixture: ComponentFixture<EditBoardDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBoardDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditBoardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
