import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteCardActions } from 'src/app/models/interface/card/actions/DeleteCardActions';
import { ColumnsComponent } from './columns.component';

describe('ColumnsComponent', () => {
  let component: ColumnsComponent;
  let fixture: ComponentFixture<ColumnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ColumnsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit edit column event when handleColumnEditEvent is called', () => {
    const editColumnEventSpy = spyOn(component.editColumnEvent, 'emit');
    component.handleColumnEditEvent('edit', '1');
    expect(editColumnEventSpy).toHaveBeenCalledWith({
      action: 'edit',
      id: '1',
    });
  });

  it('should emit delete column event when handleColumnDeleteEvent is called', () => {
    const deleteColumnEventSpy = spyOn(component.deleteColumnEvent, 'emit');
    component.handleColumnDeleteEvent('Title', '1');
    expect(deleteColumnEventSpy).toHaveBeenCalledWith({
      title: 'Title',
      id: '1',
    });
  });

  it('should emit add card event when handleAddCardEvent is called', () => {
    const addCardEventSpy = spyOn(component.addCardEvent, 'emit');
    component.handleAddCardEvent('add', '1');
    expect(addCardEventSpy).toHaveBeenCalledWith({ action: 'add', id: '1' });
  });

  it('should emit edit card event when handleEditCardEvent is called', () => {
    const editCardEventSpy = spyOn(component.editCardEvent, 'emit');
    const event = { action: 'edit', id: '1' };
    component.handleEditCardEvent(event);
    expect(editCardEventSpy).toHaveBeenCalledWith(event);
  });

  it('should emit delete card event when handleDeleteCardEvent is called', () => {
    const deleteCardEventSpy = spyOn(component.deleteCardEvent, 'emit');
    const event: DeleteCardActions = { title: 'Title', id: '1' };
    component.handleDeleteCardEvent(event);
    expect(deleteCardEventSpy).toHaveBeenCalledWith(event);
  });

  it('should emit edit column to card event when handleEditColumnToCardEvent is called', () => {
    const editColumnToCardEventSpy = spyOn(
      component.editColumnToCardEvent,
      'emit'
    );
    const event = { action: 'edit', id: '1' };
    component.handleEditColumnToCardEvent(event);
    expect(editColumnToCardEventSpy).toHaveBeenCalledWith(event);
  });
});
