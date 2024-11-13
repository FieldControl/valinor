import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AddButtonComponent } from './add.button.component';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { GraphqlService } from '../graphql/graphql.service';
import { of } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('AddButtonComponent', () => {
  let component: AddButtonComponent;
  let fixture: ComponentFixture<AddButtonComponent>;
  let graphqlServiceMock: jasmine.SpyObj<GraphqlService>;
  let modalServiceMock: jasmine.SpyObj<NzModalService>;

  beforeEach(async () => {
    graphqlServiceMock = jasmine.createSpyObj('GraphqlService', ['query']);
    graphqlServiceMock.query.and.returnValue(of({ data: {} }));
    modalServiceMock = jasmine.createSpyObj('NzModalService', ['create']);

    await TestBed.configureTestingModule({
      imports: [
        AddButtonComponent,
        CommonModule,
        NzButtonModule,
      ],
      providers: [
        { provide: GraphqlService, useValue: graphqlServiceMock },
        { provide: NzModalService, useValue: modalServiceMock },
        provideAnimations()
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
