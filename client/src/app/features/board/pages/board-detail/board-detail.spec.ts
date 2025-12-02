import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { BoardsDetail } from './board-detail';

describe('BoardsDetail', () => {
  let component: BoardsDetail;
  let fixture: ComponentFixture<BoardsDetail>;
  let apolloSpy: any;

  const mockBoardData = {
    id: 1,
    title: 'Quadro de Teste',
    columns: [
      { id: 10, title: 'To Do', cards: [] }
    ]
  };

  beforeEach(async () => {
    apolloSpy = {
      watchQuery: jasmine.createSpy('watchQuery').and.returnValue({
        valueChanges: of({
          data: { board: mockBoardData },
          loading: false
        })
      }),
      mutate: jasmine.createSpy('mutate').and.returnValue(of({}))
    };

    const routeSpy = {
      snapshot: {
        paramMap: {
          get: () => '1' 
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [BoardsDetail],
      providers: [
        { provide: Apollo, useValue: apolloSpy },
        { provide: ActivatedRoute, useValue: routeSpy }
      ],
      // NO_ERRORS_SCHEMA ignora componentes filhos (app-columns, app-modal)
      // Isso foca o teste apenas na lógica da página pai.
      schemas: [NO_ERRORS_SCHEMA] 
    }).compileComponents();

    fixture = TestBed.createComponent(BoardsDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve buscar os dados do board ao iniciar', () => {
    // Verifica se chamou o Apollo
    expect(apolloSpy.watchQuery).toHaveBeenCalled();
    
    // Verifica se pegou o ID 1 da rota e passou para a query
    const args = apolloSpy.watchQuery.calls.mostRecent().args[0];
    expect(args.variables.id).toBe(1);

    // Verifica se os dados foram salvos na variável do componente
    expect(component.board.title).toBe('Quadro de Teste');
    expect(component.board.columns.length).toBe(1);
  });

  it('deve abrir o modal de criação de coluna', () => {
    component.openCreateColumnModal();
    
    expect(component.isColumnModalOpen).toBeTrue();
    expect(component.modalMode).toBe('create');
    expect(component.selectedColumn).toBeNull();
  });

  it('deve abrir o modal de edição de coluna', () => {
    const colMock = { id: 5, title: 'Edit Me' };
    component.openEditColumnModal(colMock);

    expect(component.isColumnModalOpen).toBeTrue();
    expect(component.modalMode).toBe('edit');
    expect(component.selectedColumn).toEqual(colMock);
  });

  it('deve chamar a mutation ao mover um card (Drag & Drop)', () => {
    const eventoDrag = {
      cardId: 100,
      newColumnId: 2
    };

    component.onCardMoved(eventoDrag);

    expect(apolloSpy.mutate).toHaveBeenCalled();
    
    // Verifica se passou as variáveis certas
    const args = apolloSpy.mutate.calls.mostRecent().args[0];
    expect(args.variables.updateCardInput.id).toBe(100);
    expect(args.variables.updateCardInput.columnId).toBe(2);
  });
});