import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardModalComponent } from './board-modal.component';

describe('BoardModalComponent', () => {
  let component: BoardModalComponent;
  let fixture: ComponentFixture<BoardModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BoardModalComponent]
    });
    fixture = TestBed.createComponent(BoardModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
