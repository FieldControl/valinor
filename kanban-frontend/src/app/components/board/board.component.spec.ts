import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoardComponent } from './board.component';
import { GraphqlService } from '../../shared/graphql/graphql.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DemoNgZorroAntdModule } from '../../shared/utils/DemoNgZorroAntdModules';
import { CardComponent } from '../card/card.component';
import { ColumnComponent } from '../column/column.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let graphqlServiceMock: jasmine.SpyObj<GraphqlService>;

  beforeEach(() => {
    graphqlServiceMock = jasmine.createSpyObj('GraphqlService', ['query']);
    
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        DemoNgZorroAntdModule,
        CardComponent,
        ColumnComponent,
        DragDropModule,
        BoardComponent
      ],
      providers: [
        { provide: GraphqlService, useValue: graphqlServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
  });

  it('should create the BoardComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch boards data and set loading to false when data is loaded', () => {
    const mockBoards = [
      { id: 1, userId: 3, name: 'Board 1' },
      { id: 2, userId: 3, name: 'Board 2' }
    ];
    
    graphqlServiceMock.query.and.returnValue(of({ data: { getAllBoards: mockBoards } }));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.boards).toEqual(mockBoards);
    expect(component.loading).toBe(false);
  });

  it('should handle error when fetching boards data fails', () => {
    const errorResponse = 'Failed to fetch boards';
    graphqlServiceMock.query.and.returnValue(throwError(() => new Error(errorResponse)));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.error).toEqual(new Error(errorResponse));
    expect(component.loading).toBe(false);
  });

  it('should filter boards by userId 3', () => {
    const mockBoards = [
      { id: 1, userId: 3, name: 'Board 1' },
      { id: 2, userId: 2, name: 'Board 2' },
      { id: 3, userId: 3, name: 'Board 3' }
    ];
    
    graphqlServiceMock.query.and.returnValue(of({ data: { getAllBoards: mockBoards } }));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.boards.length).toBe(2);
    expect(component.boards).toEqual([
      { id: 1, userId: 3, name: 'Board 1' },
      { id: 3, userId: 3, name: 'Board 3' }
    ]);
  });

  it('should set loading to false when the data fetching is done', () => {
    graphqlServiceMock.query.and.returnValue(of({ data: { getAllBoards: [] } }));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.loading).toBe(false);
  });
});
