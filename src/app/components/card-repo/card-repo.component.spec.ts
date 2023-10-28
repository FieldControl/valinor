import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardRepoComponent } from './card-repo.component';

describe('CardComponent', () => {
  let component: CardRepoComponent;
  let fixture: ComponentFixture<CardRepoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CardRepoComponent]
    });
    fixture = TestBed.createComponent(CardRepoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
