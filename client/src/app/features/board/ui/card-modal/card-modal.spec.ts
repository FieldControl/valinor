import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';

import { CardModal } from './card-modal';

describe('CardModal', () => {
  let component: CardModal;
  let fixture: ComponentFixture<CardModal>;
  let apolloSpy: any;

  beforeEach(async () => {
    apolloSpy = {
      mutate: jasmine.createSpy('mutate').and.returnValue(of({ data: { id: 1 } }))
    };

    await TestBed.configureTestingModule({
      imports: [CardModal],
      providers: [
        { provide: Apollo, useValue: apolloSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CardModal);
    component = fixture.componentInstance;
    
    // Inputs obrigatórios para o modal não quebrar
    component.boardId = 1;
    component.mode = 'create';
    
    fixture.detectChanges();
  });

  it('NÃO deve chamar o servidor se o formulário for inválido', () => {
    component.form.patchValue({ title: '' });
    component.submit();
    
    expect(apolloSpy.mutate).not.toHaveBeenCalled();
  });

  it('deve chamar a mutation se o formulário estiver válido', () => {
    component.form.patchValue({ title: 'Tarefa de Teste' });
    
    component.submit();

    expect(apolloSpy.mutate).toHaveBeenCalled();
  });

  it('deve preencher o formulário se estiver no modo de edição', () => {
    // Cenário de Edição
    component.mode = 'edit';
    component.cardData = { id: 10, title: 'Card Teste' };
    
    // Forçamos o ngOnInit de novo
    component.ngOnInit();

    // Verifica se o formulário puxou o dado
    expect(component.form.get('title')?.value).toBe('Card Teste');
  });
});
