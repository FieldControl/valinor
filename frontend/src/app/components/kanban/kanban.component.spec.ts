import { KanbanService } from './../../services/kanban.service';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { KanbanComponent } from './kanban.component';
import { CardService } from 'src/app/services/card.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ExceptionErrorsMessage } from 'src/app/utils/exception-errors-message';
import { Kanban } from 'src/app/models/kanban';
import { Card } from 'src/app/models/card';

describe('KanbanComponent', () => {
  let component: KanbanComponent;
  let fixture: ComponentFixture<KanbanComponent>;
  let kanbanService: KanbanService;
  let cardService: CardService;
  let mockKanbanService: Partial<KanbanService>;
  let mockCardService: Partial<CardService>;

  beforeEach(async () => {
    mockKanbanService = {
      list: () => of([]),
      create: (kanban: Kanban) => of({} as { kanban: Kanban, message: '' }),
      delete: (id: string) => of({} as { kanban: Kanban, message: '' }),
      update: (kanban: Kanban) => of({} as Kanban),
      listCardKanban: (kanban_id:string) => of([] as Card[]),
      createCardInKanban: (card: Card, kanban_id: string) => of({} as { card: Card, message: string })
    };

    mockCardService = {
      linkBadgeToCard: (card_id: string, badge_id: string) => of({} as Card)
    }
    await TestBed.configureTestingModule({
      declarations: [KanbanComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [
        ExceptionErrorsMessage,
        { provide: KanbanService, useValue: mockKanbanService },
        { provide: CardService, useValue: mockCardService },
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KanbanComponent);
    component = fixture.componentInstance;
    kanbanService = TestBed.inject(KanbanService);
    cardService = TestBed.inject(CardService);
    fixture.detectChanges();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should call serviceKanban.list() on initialization', async () => {
    const kanbanList: Kanban[] = [{ id: '1', name: 'Test Kanban', cards: [] }];
    spyOn(kanbanService, 'list').and.returnValue(of(kanbanList));
    component.ngOnInit();
    fixture.whenStable().then(() => {
      expect(component.kanban).toEqual(kanbanList);
    })
  });

  it('should call serviceKanban.createCardInKanban() when adding a new card in a list', async () => {
    const kanbanList: Kanban[] = [{ id: '1', name: 'Test Kanban', cards: [] }];
    const newCardTitle = 'New Card Title';
    const kanban_id = '1';
    const newCard: Card = { id: '3', title: newCardTitle, kanban_id: kanban_id, order: 0 };
    const observableResponse = of({ card: newCard, message: 'Card Inserido !' });
    component.kanban = kanbanList;
    spyOn(kanbanService, 'createCardInKanban').and.returnValue(observableResponse);
    await component.addCard(newCardTitle, kanban_id);
    expect(kanbanService.createCardInKanban).toHaveBeenCalledWith(newCard, kanban_id)
    expect(component.kanban.find(kanban => kanban.id === kanban_id)?.cards).toContain(jasmine.objectContaining(newCard));
  });

  it('should call serviceKanban.create() when adding a new list', async () => {
    const newKanban: Kanban = { id: '2', name: 'New Kanban', cards: [] };
    const response = { kanban: newKanban, message: 'Inserido com sucesso !' };
    const observableResponse = of(response);
    spyOn(kanbanService, 'create').and.returnValue(observableResponse);
    await component.createAndAddKanban(newKanban);
    fixture.whenStable().then(() => {
      expect(component.kanban).toContain(newKanban);
    })
  });

  it('Should call serviceKanban.delete() when delete a list', async () => {
    const kanbanList: Kanban[] = [{ id: '1', name: 'Test Kanban', cards: [] }];
    const kanban_id = '1';
    spyOn(kanbanService, 'delete').and.returnValue(of({ kanban: kanbanList[0], message: 'Deletado com sucesso !' }));
    component.kanban = kanbanList;
    await component.deleteList(kanban_id);
    expect(kanbanService.delete).toHaveBeenCalledWith(kanban_id);
  })

  it('Should call serviceKanban.update() when update a name list', async () => {
    const kanbanList: Kanban[] = [{ id: '1', name: 'Test Kanban', cards: [] }];
    const updatedKanbanName = 'Updated Kanban Name';
    const updatedKanban: Kanban = { ...kanbanList[0], name: updatedKanbanName }
    spyOn(kanbanService, 'update').and.returnValue(of(updatedKanban as Kanban));
    component.kanban = kanbanList;
    await component.saveListName(updatedKanban);
    expect(kanbanService.update).toHaveBeenCalledWith(updatedKanban);
  })


});
