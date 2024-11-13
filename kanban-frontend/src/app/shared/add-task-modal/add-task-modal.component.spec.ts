import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddTaskModalComponent } from './add-task-modal.component';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { of } from 'rxjs';
import { GraphqlService } from '../graphql/graphql.service';

describe('AddTaskModalComponent', () => {
  let component: AddTaskModalComponent;
  let fixture: ComponentFixture<AddTaskModalComponent>;
  let graphqlServiceMock: jasmine.SpyObj<GraphqlService>;
  let modalServiceMock: jasmine.SpyObj<NzModalService>;

  beforeEach(async () => {
    graphqlServiceMock = jasmine.createSpyObj('GraphqlService', ['query']);
    graphqlServiceMock.query.and.returnValue(of({ data: {} }));
    modalServiceMock = jasmine.createSpyObj('NzModalService', ['create']);

    await TestBed.configureTestingModule({
      imports: [AddTaskModalComponent],
      providers: [
        { provide: GraphqlService, useValue: graphqlServiceMock },
        { provide: NzModalService, useValue: modalServiceMock },
        { provide: NzModalRef, useValue: modalServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTaskModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
