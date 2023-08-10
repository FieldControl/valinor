import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CardComponent]
    });
    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Deve retornar a cor correta para a linguagem fornecida', () => {
    const component = new CardComponent();
    const language = 'Mercury';
    const expectedColor = '#ff2b2b';
    const actualColor = component.getLanguageColor(language);

    expect(actualColor).toEqual(expectedColor);
  });

  it('Deve retornar a cor gray caso não ache uma linguagem correspondente', () => {
    const component = new CardComponent();
    const language = 'teste';
    const expectedColor = 'gray';
    const actualColor = component.getLanguageColor(language);

    expect(actualColor).toEqual(expectedColor);
  });
});
