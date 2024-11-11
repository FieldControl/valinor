import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';
import { GraphqlService } from '../../shared/graphql/graphql.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CommonModule } from '@angular/common';
import { DemoNgZorroAntdModule } from '../../shared/utils/DemoNgZorroAntdModules';
import { CdkDragDrop, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { of, throwError } from 'rxjs';
import { Card } from './card.interface';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
  let graphqlServiceMock: jasmine.SpyObj<GraphqlService>;
  let modalServiceMock: jasmine.SpyObj<NzModalService>;

  beforeEach(async () => {
    graphqlServiceMock = jasmine.createSpyObj('GraphqlService', ['query', 'mutate']);
    modalServiceMock = jasmine.createSpyObj('NzModalService', ['create']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, CardComponent, DemoNgZorroAntdModule, DragDropModule],
      providers: [
        { provide: GraphqlService, useValue: graphqlServiceMock },
        { provide: NzModalService, useValue: modalServiceMock },
        provideAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('deleteCard', () => {
    it('should delete card successfully', () => {
      const mockCardId = 1;
      const mutationResponse = { data: { deleteCard: true } };
      graphqlServiceMock.mutate.and.returnValue(of(mutationResponse));

      component.deleteCard(mockCardId);

      expect(graphqlServiceMock.mutate).toHaveBeenCalledWith(
        jasmine.any(String), { id: mockCardId }
      );
      expect(component.cards.length).toBe(0);
    });

    it('should handle delete card error', () => {
      const mockCardId = 1;
      const mutationErrorResponse = new Error('Error deleting card');
      graphqlServiceMock.mutate.and.returnValue(throwError(mutationErrorResponse));

      component.deleteCard(mockCardId);

      expect(graphqlServiceMock.mutate).toHaveBeenCalledWith(
        jasmine.any(String), { id: mockCardId }
      );
      expect(component.cards.length).toBe(0);
    });
  });

  describe('drag and drop events for cards', () => {
    it('should call reorderTask if moving within the same container', () => {
      spyOn(component, 'reorderTask');
      const dropEvent = {
        previousIndex: 0,
        currentIndex: 1,
        previousContainer: { data: component.cards } as CdkDropList,
        container: { data: component.cards } as CdkDropList,
      } as CdkDragDrop<Card[]>;
      component.moveTask(dropEvent);
      expect(component.reorderTask).not.toHaveBeenCalled();
    });
  
    it('should call transferTask if moving between different containers', () => {
      spyOn(component, 'transferTask');
      const dropEvent = {
        previousIndex: 0,
        currentIndex: 1,
        previousContainer: { data: component.cards } as CdkDropList,
        container: { data: [] } as CdkDropList,
      } as CdkDragDrop<Card[]>;
      component.moveTask(dropEvent);
      expect(component.transferTask).toHaveBeenCalledWith(component.cards, [], 0, 1);
    });
  
    it('should not call reorderTask if dropped in the same position', () => {
      spyOn(component, 'reorderTask');
      const dropEvent = {
        previousIndex: 0,
        currentIndex: 0,
        previousContainer: { data: component.cards } as CdkDropList,
        container: { data: component.cards } as CdkDropList,
      } as CdkDragDrop<Card[]>;
      component.moveTask(dropEvent);
      expect(component.reorderTask).not.toHaveBeenCalled();
    });
  });
});
