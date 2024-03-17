import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, of } from 'rxjs';
import { DeleteCardActions } from 'src/app/models/interface/card/actions/DeleteCardActions';
import { CardsResponse } from 'src/app/models/interface/card/response/CardsResponse';
import { DeleteColumnsActions } from 'src/app/models/interface/column/actions/DeleteColumnsActions';
import { ColumnsResponse } from 'src/app/models/interface/column/response/ColumnsResponse';
import { CardService } from 'src/app/service/card/card.service';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { ColumnService } from './../../../service/column/column.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let columnService: ColumnService;
  let cardService: CardService;
  let dialogServiceMock: jasmine.SpyObj<DialogService>;

  beforeEach(async () => {
    const dialogRefMock = {
      onClose: new Subject<any>(),
      close: jasmine.createSpy('close'),
    };

    dialogServiceMock = jasmine.createSpyObj('DialogService', ['open']);

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent, HeaderComponent],
      providers: [
        ColumnService,
        CardService,
        { provide: Apollo, useValue: {} },
        { provide: DialogService, useValue: dialogServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    columnService = TestBed.inject(ColumnService);
    cardService = TestBed.inject(CardService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get all columns data', () => {
    const columnsResponse: ColumnsResponse[] = [
      {
        id: '1',
        title: 'new title',
      },
      {
        id: '2',
        title: 'new title2',
      },
    ];
    spyOn(columnService, 'getAllColumns').and.returnValue(of(columnsResponse));

    component.getAllColumnsDatas();

    expect(component.columnsDatas).toEqual(columnsResponse);
  });

  it('should get all cards data', () => {
    const cardsResponse: CardsResponse[] = [
      {
        id: '1',
        title: 'new title',
        description: 'new description',
        columnsTable: {
          id: '1',
        },
        user: {
          id: '1',
          name: '1',
        },
      },
      {
        id: '2',
        title: 'new title2',
        description: 'new descriptio2',
        columnsTable: {
          id: '2',
        },
        user: {
          id: '2',
          name: '2',
        },
      },
    ];
    spyOn(cardService, 'getAllCards').and.returnValue(of(cardsResponse));

    component.getAllCardsDatas();

    expect(component.cardsDatas).toEqual(cardsResponse);
  });

  it('should return cards filtered by columnId', () => {
    const columnId = '1';
    const cards: CardsResponse[] = [
      {
        id: '1',
        title: 'new title',
        description: 'new description',
        columnsTable: {
          id: '1',
        },
        user: {
          id: '1',
          name: '1',
        },
      },
      {
        id: '2',
        title: 'new title',
        description: 'new description',
        columnsTable: {
          id: '1',
        },
        user: {
          id: '1',
          name: '1',
        },
      },
      {
        id: '3',
        title: 'new title',
        description: 'new description',
        columnsTable: {
          id: '2',
        },
        user: {
          id: '1',
          name: '1',
        },
      },
    ];

    component.cardsDatas = cards;

    const filteredCards = component.getCardsByColumn(columnId);

    expect(filteredCards.length).toBe(2);
    expect(filteredCards[0].columnsTable.id).toBe(columnId);
    expect(filteredCards[1].columnsTable.id).toBe(columnId);
  });

  it('should call handleEventAction with action and columnsDatas when action is addColumnEvent', () => {
    const action = component.addColumnEvent;

    const columnsDatas: ColumnsResponse[] = [
      {
        id: '1',
        title: 'new title',
      },
      {
        id: '2',
        title: 'new title2',
      },
    ];

    spyOn(component, 'handleEventAction');

    component.columnsDatas = columnsDatas;
    component.handleColumnEvent(action);

    expect(component.handleEventAction).toHaveBeenCalledWith(
      { action },
      columnsDatas
    );
  });

  it('should call handleEventAction with action and columnsDatas when action is editColumnEvent', () => {
    const action = component.editColumnEvent;
    const id = '1';

    const columnsDatas: ColumnsResponse[] = [
      {
        id: '1',
        title: 'new title',
      },
      {
        id: '2',
        title: 'new title2',
      },
    ];

    spyOn(component, 'handleEventAction');

    component.columnsDatas = columnsDatas;
    component.handleColumnEvent(action, id);

    expect(component.handleEventAction).toHaveBeenCalledWith(
      { action, id },
      columnsDatas
    );
  });

  it('should call handleEventAction with action and columnsDatas when action is editColumnToCard', () => {
    const action = component.editColumnToCard;
    const id = '1';

    const columnsDatas: ColumnsResponse[] = [
      {
        id: '1',
        title: 'new title',
      },
      {
        id: '2',
        title: 'new title2',
      },
    ];

    spyOn(component, 'handleEventAction');

    component.columnsDatas = columnsDatas;
    component.handleColumnEvent(action, id);

    expect(component.handleEventAction).toHaveBeenCalledWith(
      { action, id },
      columnsDatas
    );
  });

  it('should call handleEventAction with action and cardsDatas when action is addCardEvent', () => {
    const action = component.addCardEvent;
    const id = '1';

    const cardsDatas: CardsResponse[] = [
      {
        id: '1',
        title: 'new title',
        description: 'new description',
        columnsTable: {
          id: '1',
        },
        user: {
          id: '1',
          name: '1',
        },
      },
      {
        id: '2',
        title: 'new title2',
        description: 'new descriptio2',
        columnsTable: {
          id: '2',
        },
        user: {
          id: '2',
          name: '2',
        },
      },
    ];

    spyOn(component, 'handleEventAction');

    component.cardsDatas = cardsDatas;
    component.handleCardEvent(action, id);

    expect(component.handleEventAction).toHaveBeenCalledWith(
      { action, id },
      cardsDatas
    );
  });

  it('should call handleEventAction with action and cardsDatas when action is editCardEvent', () => {
    const action = component.editCardEvent;
    const id = '1';

    const cardsDatas: CardsResponse[] = [
      {
        id: '1',
        title: 'new title',
        description: 'new description',
        columnsTable: {
          id: '1',
        },
        user: {
          id: '1',
          name: '1',
        },
      },
      {
        id: '2',
        title: 'new title2',
        description: 'new descriptio2',
        columnsTable: {
          id: '2',
        },
        user: {
          id: '2',
          name: '2',
        },
      },
    ];

    spyOn(component, 'handleEventAction');

    component.cardsDatas = cardsDatas;
    component.handleCardEvent(action, id);

    expect(component.handleEventAction).toHaveBeenCalledWith(
      { action, id },
      cardsDatas
    );
  });

  it('should return cards with the changed card', () => {
    const cards: CardsResponse[] = [
      {
        id: '1',
        title: 'new title',
        description: 'new description',
        columnsTable: {
          id: '1',
        },
        user: {
          id: '1',
          name: '1',
        },
      },
      {
        id: '2',
        title: 'new title',
        description: 'new description',
        columnsTable: {
          id: '1',
        },
        user: {
          id: '1',
          name: '1',
        },
      },
      {
        id: '3',
        title: 'new title',
        description: 'new description',
        columnsTable: {
          id: '2',
        },
        user: {
          id: '1',
          name: '1',
        },
      },
    ];

    const cardUpdate: CardsResponse = {
      id: '1',
      title: 'update title',
      description: 'update description',
      columnsTable: {
        id: '1',
      },
      user: {
        id: '1',
        name: '1',
      },
    };

    component.cardsDatas = cards;

    component.handleEditArrayCards(cardUpdate);

    expect(component.cardsDatas[0].title).toBe('update title');
    expect(component.cardsDatas[0].description).toBe('update description');
  });

  it('should return cards with a new card added', () => {
    const cards: CardsResponse[] = [
      {
        id: '1',
        title: 'new title',
        description: 'new description',
        columnsTable: {
          id: '1',
        },
        user: {
          id: '1',
          name: '1',
        },
      },
      {
        id: '2',
        title: 'new title',
        description: 'new description',
        columnsTable: {
          id: '1',
        },
        user: {
          id: '1',
          name: '1',
        },
      },
      {
        id: '3',
        title: 'new title',
        description: 'new description',
        columnsTable: {
          id: '2',
        },
        user: {
          id: '1',
          name: '1',
        },
      },
    ];

    const cardUpdate: CardsResponse = {
      id: '4',
      title: 'update title',
      description: 'update description',
      columnsTable: {
        id: '1',
      },
      user: {
        id: '1',
        name: '1',
      },
    };

    component.cardsDatas = cards;

    component.handleEditArrayCards(cardUpdate);

    expect(component.cardsDatas.length).toBe(4);
    expect(component.cardsDatas[3].title).toBe('update title');
    expect(component.cardsDatas[3].description).toBe('update description');
  });

  it('should return columns with the changed column', () => {
    const columns: ColumnsResponse[] = [
      {
        id: '1',
        title: 'new title',
      },
      {
        id: '2',
        title: 'new title2',
      },
    ];

    const columnUpdate: ColumnsResponse = {
      id: '1',
      title: 'update title',
    };

    component.columnsDatas = columns;

    component.handleEditArrayColumns(columnUpdate);

    expect(component.columnsDatas.length).toBe(2);
    expect(component.columnsDatas[0].title).toBe('update title');
  });

  it('should return columns with a new column added', () => {
    const columns: ColumnsResponse[] = [
      {
        id: '1',
        title: 'new title',
      },
      {
        id: '2',
        title: 'new title2',
      },
    ];

    const columnUpdate: ColumnsResponse = {
      id: '3',
      title: 'new title3',
    };

    component.columnsDatas = columns;

    component.handleEditArrayColumns(columnUpdate);

    expect(component.columnsDatas.length).toBe(3);
    expect(component.columnsDatas[2].title).toBe('new title3');
  });

  it('should pass the correct data when the event is passed', () => {
    const event = { action: 'editColumnEvent' };
    const data = [
      {
        id: '1',
        title: 'new title',
      },
      {
        id: '2',
        title: 'new title2',
      },
    ];

    spyOn(component, 'handleEventAction');

    component.handleEventAction(event, data);

    expect(component.handleEventAction).toHaveBeenCalledWith(event, data);
  });

  it('should open dialog with correct data when event is passed', () => {
    const event = { action: 'editColumnEvent' };
    const data = [
      {
        id: '1',
        title: 'new title',
      },
      {
        id: '2',
        title: 'new title2',
      },
    ];

    component.handleEventAction(event, data);

    expect(dialogServiceMock.open).toHaveBeenCalledWith(jasmine.any(Function), {
      width: '500px',
      contentStyle: { overflow: 'auto', position: 'relative' },
      baseZIndex: 10000,
      closeOnEscape: true,
      maximizable: false,
      closable: false,
      data: {
        event: event,
        data,
      },
      style: {
        style: {
          'min-width': '360px',
        },
      },
    });
  });

  it('should confirm column deletion and call deleteColumn', () => {
    const event: DeleteColumnsActions = { id: '1', title: 'Column' };
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component, 'deleteColumn');

    component.handleDeleteColumnEvent(event);

    expect(window.confirm).toHaveBeenCalledWith(
      `Confirma a exclusão da coluna: ${event.title}?`
    );

    expect(component.deleteColumn).toHaveBeenCalledWith(event.id);
  });

  it('should not call deleteColumn if user cancels deletion', () => {
    const event: DeleteColumnsActions = { id: '1', title: 'Column' };
    spyOn(window, 'confirm').and.returnValue(false);
    spyOn(component, 'deleteColumn');

    component.handleDeleteColumnEvent(event);

    expect(window.confirm).toHaveBeenCalledWith(
      `Confirma a exclusão da coluna: ${event.title}?`
    );
    expect(component.deleteColumn).not.toHaveBeenCalled();
  });

  it('should confirm column deletion and call deleteCard', () => {
    const event: DeleteCardActions = { id: '1', title: 'Card' };
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component, 'deleteCard');

    component.handleEventDeleteCard(event);

    expect(window.confirm).toHaveBeenCalledWith(
      `Confirma a exclusão da coluna: ${event.title}?`
    );

    expect(component.deleteCard).toHaveBeenCalledWith(event.id);
  });

  it('should delete a column', () => {
    const id = '1';
    const columnsResponse: ColumnsResponse[] = [
      {
        id: '1',
        title: 'new title',
      },
      {
        id: '2',
        title: 'new title2',
      },
    ];

    component.columnsDatas = columnsResponse;

    spyOn(columnService, 'deleteColumn').and.returnValue(of(true));
    component.deleteColumn(id);

    expect(columnService.deleteColumn).toHaveBeenCalledWith(id);
  });

  it('should not call deleteCard if user cancels deletion', () => {
    const event: DeleteCardActions = { id: '1', title: 'Column' };
    spyOn(window, 'confirm').and.returnValue(false);
    spyOn(component, 'deleteCard');

    component.handleEventDeleteCard(event);

    expect(window.confirm).toHaveBeenCalledWith(
      `Confirma a exclusão da coluna: ${event.title}?`
    );

    expect(component.deleteCard).not.toHaveBeenCalled();
  });

  it('should delete a card', () => {
    const id = '1';
    const cardsResponse: CardsResponse[] = [
      {
        id: '1',
        title: 'new title',
        description: 'new description',
        columnsTable: {
          id: '1',
        },
        user: {
          id: '1',
          name: '1',
        },
      },
      {
        id: '2',
        title: 'new title2',
        description: 'new descriptio2',
        columnsTable: {
          id: '2',
        },
        user: {
          id: '2',
          name: '2',
        },
      },
    ];

    component.cardsDatas = cardsResponse;

    spyOn(cardService, 'deleteCard').and.returnValue(of(true));
    component.deleteCard(id);

    expect(cardService.deleteCard).toHaveBeenCalledWith(id);
  });
});
