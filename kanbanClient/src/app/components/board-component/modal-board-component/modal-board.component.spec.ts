import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalBoardComponent } from './modal-board.component';

describe('ModalBoardComponent', () => {
  let component: ModalBoardComponent;
  let fixture: ComponentFixture<ModalBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
