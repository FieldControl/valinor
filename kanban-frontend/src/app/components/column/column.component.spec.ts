import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColumnComponent } from './column.component';
import { CdkDropList, CdkDragDrop } from '@angular/cdk/drag-drop';
import { GraphqlService } from '../../shared/graphql/graphql.service';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ColumnComponent', () => {
  let component: ColumnComponent;
  let fixture: ComponentFixture<ColumnComponent>;
  let graphqlServiceMock: jasmine.SpyObj<GraphqlService>;

  beforeEach(async () => {
    graphqlServiceMock = jasmine.createSpyObj('GraphQLService', ['query']);
    graphqlServiceMock.query.and.returnValue(of({ data: {} }));

    await TestBed.configureTestingModule({
      imports: [ColumnComponent],
      providers: [
        { provide: GraphqlService, useValue: graphqlServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('moveColumnList', () => {
    it('should reorder columns correctly', () => {
      component.columns = [{ id: 1, name: 'Column 1' }, { id: 2, name: 'Column 2' }];
      component.moveColumnList(0, 1);
      expect(component.columns[0].id).toBe(2);
      expect(component.columns[1].id).toBe(1);
    });
  });

  describe('moveList', () => {
    it('should call moveColumnList when moving columns within the same container', () => {
      spyOn(component, 'moveColumnList');
      const dropEvent = {
        previousIndex: 0,
        currentIndex: 1,
        previousContainer: { data: component.columns } as CdkDropList,
        container: { data: component.columns } as CdkDropList,
      } as CdkDragDrop<any>;
      component.moveList(dropEvent);
      expect(component.moveColumnList).toHaveBeenCalledWith(0, 1);
    });
  });

  describe('drag and drop events', () => {
    it('should call reorderTask if moving within the same container', () => {
      spyOn(component, 'moveColumnList');
      const dropEvent = {
        previousIndex: 0,
        currentIndex: 1,
        previousContainer: { data: component.columns } as CdkDropList,
        container: { data: component.columns } as CdkDropList,
      } as CdkDragDrop<any>;
      component.moveList(dropEvent);
      expect(component.moveColumnList).toHaveBeenCalled();
    });

    it('should not call moveColumnList if dropped in the same position', () => {
      spyOn(component, 'moveColumnList');
      const dropEvent = {
        previousIndex: 0,
        currentIndex: 0,
        previousContainer: { data: component.columns } as CdkDropList,
        container: { data: component.columns } as CdkDropList,
      } as CdkDragDrop<any>;
      component.moveList(dropEvent);
      expect(component.moveColumnList).not.toHaveBeenCalled();
    });
  });
});
