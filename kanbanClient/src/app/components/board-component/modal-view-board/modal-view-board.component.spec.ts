import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalViewBoardComponent } from './modal-view-board.component';

describe('ModalViewBoardComponent', () => {
  let component: ModalViewBoardComponent;
  let fixture: ComponentFixture<ModalViewBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalViewBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalViewBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
