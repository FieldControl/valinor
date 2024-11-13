import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { BoardComponent } from '../../components/board/board.component';
import { CommonModule } from '@angular/common';
import { GraphqlService } from '../../shared/graphql/graphql.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  let graphqlServiceMock: jasmine.SpyObj<GraphqlService>;

  beforeEach(async () => {
    graphqlServiceMock = jasmine.createSpyObj('GraphqlService', ['query']);
    graphqlServiceMock.query.and.returnValue(of({ data: { getAllBoards: [] } }));

    await TestBed.configureTestingModule({
      imports: [CommonModule, HomeComponent, BoardComponent],
      providers: [
        { provide: GraphqlService, useValue: graphqlServiceMock }
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the BoardComponent', () => {
    const boardComponentElement = fixture.debugElement.query(By.directive(BoardComponent));
    expect(boardComponentElement).toBeTruthy();
  });
});
