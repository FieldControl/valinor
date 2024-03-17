import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit edit event when handleEditCardEvent is called', () => {
    const editCardEventSpy = spyOn(component.editCardEvent, 'emit');
    component.handleEditCardEvent('edit', '1');
    expect(editCardEventSpy).toHaveBeenCalledWith({ action: 'edit', id: '1' });
  });

  it('should emit delete event when handleCardDeleteEvent is called', () => {
    const deleteCardEventSpy = spyOn(component.deleteCardEvent, 'emit');
    component.handleCardDeleteEvent('Title', '1');
    expect(deleteCardEventSpy).toHaveBeenCalledWith({
      title: 'Title',
      id: '1',
    });
  });

  it('should emit edit column event when handleEditColumnToCardEvent is called', () => {
    const editColumnToCardEventSpy = spyOn(
      component.editColumnToCardEvent,
      'emit'
    );
    component.handleEditColumnToCardEvent('move', '1');
    expect(editColumnToCardEventSpy).toHaveBeenCalledWith({
      action: 'move',
      id: '1',
    });
  });
});
