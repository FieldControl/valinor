import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserStarBtnComponent } from './user-star-btn.component';

describe('UserStarBtnComponent', () => {
  let component: UserStarBtnComponent;
  let fixture: ComponentFixture<UserStarBtnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserStarBtnComponent]
    });
    fixture = TestBed.createComponent(UserStarBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
