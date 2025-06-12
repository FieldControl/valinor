import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditForm } from './card-edit-form';

describe('CardEditForm', () => {
  let component: CardEditForm;
  let fixture: ComponentFixture<CardEditForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEditForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEditForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
