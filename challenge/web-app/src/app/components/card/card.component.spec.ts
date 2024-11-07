import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { CardComponent } from './card.component';
import { provideHttpClient } from '@angular/common/http';
import { CardService } from '../../services/card.service';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockCardService: jasmine.SpyObj<CardService>;

  beforeEach(async () => {
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockCardService = jasmine.createSpyObj('CardService', ['deleteCard']);

    await TestBed.configureTestingModule({
      imports: [CardComponent],
      providers: [
        provideHttpClient(),
        { provide: MatDialog, useValue: mockDialog },
        { provide: CardService, useValue: mockCardService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;

    component.card = {
      id: 1,
      columnId: 1,
      title: 'Test',
      description: 'test',
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call editCard and open dialog', () => {
    component.editCard(component.card);
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should call deleteCard and invoke cardService', () => {
    component.deleteCard(component.card);
    expect(mockCardService.deleteCard).toHaveBeenCalledWith(component.card.id);
  });
});
