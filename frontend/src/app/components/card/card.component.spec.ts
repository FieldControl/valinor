import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardComponent } from './card.component';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Card } from 'src/app/models/card';
import { of } from 'rxjs';
import { UpdateCardComponent } from '../update-card/update-card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    const dialogMock = jasmine.createSpyObj('MatDialog', ['open']);
    await TestBed.configureTestingModule({
      declarations: [CardComponent],
      imports: [BrowserAnimationsModule],
      providers: [
        { provide: MatDialog, useValue: dialogMock },
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open dialog when editCard is called', () => {
    const card: Card = {
      id: '1',
      kanban_id: '1',
      title: 'Test Card',
      createdAt: new Date(),
      date_end: null,
      order: 0,
      badges: [],
      description: null
    };
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}) });
    dialogSpy.open.and.returnValue(dialogRefSpyObj);

    component.card = card;
    component.nameList = 'Test List';
    component.idList = '1';

    component.editCard('1');

    expect(dialogSpy.open).toHaveBeenCalledOnceWith(UpdateCardComponent, jasmine.objectContaining({
      data: {
        card: card,
        nameList: 'Test List',
        idList: '1'
      },
      width: '639px'
    }));

    expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled();
  });
});
