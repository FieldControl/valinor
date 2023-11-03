import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardRepositoryComponent } from './card-repository.component';

describe('ContentBoxComponent', () => {
  let component: CardRepositoryComponent;
  let fixture: ComponentFixture<CardRepositoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CardRepositoryComponent]
    });
    fixture = TestBed.createComponent(CardRepositoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
