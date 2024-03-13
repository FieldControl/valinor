import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UpdateCardComponent } from './update-card.component';
import { of } from 'rxjs';
import { Badge } from '../../models/badge';
import { Card } from '../../models/card';
import { BadgeService } from 'src/app/services/badge.service';
import { CardService } from 'src/app/services/card.service';
import { HttpErrorResponse } from '@angular/common/http';

describe('UpdateCardComponent', () => {
  let component: UpdateCardComponent;
  let fixture: ComponentFixture<UpdateCardComponent>;
  let mockDialogRef: MatDialogRef<UpdateCardComponent>;
  let mockData: any;
  let cardService: CardService;
  let badgeService: BadgeService;
  let mockBadgeService: Partial<BadgeService>;
  let mockCardService: Partial<CardService>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj(['close']);
    mockData = {
      idList: 1,
      nameList: 'Test List',
      card: {
        id: '1',
        kanban_id: '1',
        title: 'Test Card',
        createdAt: new Date(),
        date_end: null,
        order: 0,
        badges: [],
        description: null
      }
    };

    mockBadgeService = {
      list: () => of([] as Badge[])
    };

    mockCardService = {
      deleteCard: (id: string) => of({} as { card:Card, message: '' }),
      updateCard: (card: Card) => of(card)
    };

    await TestBed.configureTestingModule({
      declarations: [UpdateCardComponent],
      imports: [BrowserAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: BadgeService, useValue: mockBadgeService },
        { provide: CardService, useValue: mockCardService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateCardComponent);
    component = fixture.componentInstance;
    cardService = TestBed.inject(CardService);
    badgeService = TestBed.inject(BadgeService);
    fixture.detectChanges();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog when closeModal method is called', () => {
    component.closeModal();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should delete card when deleteCard method is called', () => {
    const card: Card = {
      id: '1',
      kanban_id: '1',
      title: 'Test Card',
      order: 0
    }
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(cardService, 'deleteCard').and.returnValue(of({ card:card, message: 'Card deleted successfully' }));
    component.deleteCard('1');
    expect(cardService.deleteCard).toHaveBeenCalledWith('1');
    component.closeModal({deleted:true});
    expect(mockDialogRef.close).toHaveBeenCalledWith({ deleted: true });
  });

  it('should update card when updateCard method is called', () => {
    const updatedCard: Card = { ...mockData.card, title: 'Updated Card' };
    spyOn(cardService, 'updateCard').and.returnValue(of(updatedCard));
    component.updateCard(updatedCard);
    expect(cardService.updateCard).toHaveBeenCalledWith(updatedCard);
  });

  it('should load badges on initialization', () => {
    const badges: Badge[] = [{ id: '1', name: 'Badge 1', color: '#FF0000' }];
    spyOn(badgeService, 'list').and.returnValue(of(badges));
    component.ngOnInit();
    expect(component.badges).toEqual(badges);
  });

  // Add more test cases as needed
});

