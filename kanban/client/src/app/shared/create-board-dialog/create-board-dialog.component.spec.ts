import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBoardDialogComponent } from './create-board-dialog.component';

describe('CreateBoardDialogComponent', () => {
  let component: CreateBoardDialogComponent;
  let fixture: ComponentFixture<CreateBoardDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateBoardDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateBoardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
