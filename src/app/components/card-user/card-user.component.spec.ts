import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardUserComponent } from './card-user.component';

describe('CardUserComponent', () => {
  let component: CardUserComponent;
  let fixture: ComponentFixture<CardUserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CardUserComponent]
    });
    fixture = TestBed.createComponent(CardUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
