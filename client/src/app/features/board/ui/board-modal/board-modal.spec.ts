import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';

import { BoardModal } from './board-modal';

describe('BoardModal', () => {
  let component: BoardModal;
  let fixture: ComponentFixture<BoardModal>;
  let apolloSpy: any;

  beforeEach(async () => {
    apolloSpy = { 
      mutate: jasmine.createSpy('mutate').and.returnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [BoardModal],
      providers: [{ provide: Apollo, useValue: apolloSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(BoardModal);
    component = fixture.componentInstance;
    
    // Inputs (BoardModal não exige boardId obrigatório no create, mas é bom setar mode)
    component.mode = 'create';
    
    fixture.detectChanges();
  });

  it('NÃO deve chamar o servidor se o formulário for inválido', () => {
    component.form.patchValue({ title: '' }); // Inválido
    component.submit();
    
    expect(apolloSpy.mutate).not.toHaveBeenCalled();
  });

  it('deve chamar a mutation se o formulário estiver válido', () => {
    // Cenário Válido
    component.form.patchValue({ title: 'Quadro Aprovado' });
    
    // Ação
    component.submit();

    // Verificação
    expect(apolloSpy.mutate).toHaveBeenCalled();
    
    // Verificação Extra: O argumento estava certo?
    const args = apolloSpy.mutate.calls.mostRecent().args[0];
    expect(args.variables.createBoardInput.title).toBe('Quadro Aprovado');
  });

  it('deve preencher o formulário se estiver no modo de edição', () => {
    // Cenário de Edição
    component.mode = 'edit';
    component.boardData = { id: 10, title: 'Quadro Antigo' };
    
    // Forçamos o ngOnInit de novo
    component.ngOnInit();

    // Verifica se o formulário puxou o dado
    expect(component.form.get('title')?.value).toBe('Quadro Antigo');
  });
});