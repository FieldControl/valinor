import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Card } from './card';

describe('Card', () => {
  let component!: Card;
  let fixture!: ComponentFixture<Card>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Card],
    }).compileComponents();

    fixture = TestBed.createComponent(Card);

    fixture.componentRef.setInput('card', {
      id: 1,
      name: 'Card teste',
      description: 'Descrição',
      position: 1,
      columnId: 1,
    });

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
