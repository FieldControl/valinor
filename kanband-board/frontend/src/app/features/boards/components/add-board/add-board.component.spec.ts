import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBoardComponent } from './add-board.component';

describe('AddBoardComponent', () => {
  let component: AddBoardComponent;
  let fixture: ComponentFixture<AddBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBoardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
