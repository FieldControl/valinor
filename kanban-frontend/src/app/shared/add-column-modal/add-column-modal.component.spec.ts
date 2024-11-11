import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddColumnModalComponent } from './add-column-modal.component';
import { GraphqlService } from '../graphql/graphql.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { of } from 'rxjs';

describe('AddColumnModalComponent', () => {
  let component: AddColumnModalComponent;
  let fixture: ComponentFixture<AddColumnModalComponent>;
  let graphqlServiceMock: jasmine.SpyObj<GraphqlService>;
  let modalServiceMock: jasmine.SpyObj<NzModalService>;

  beforeEach(async () => {
    graphqlServiceMock = jasmine.createSpyObj('GraphqlService', ['query']);
    graphqlServiceMock.query.and.returnValue(of({ data: {} }));
    modalServiceMock = jasmine.createSpyObj('NzModalService', ['create']);
  
    await TestBed.configureTestingModule({
      imports: [AddColumnModalComponent],
      providers: [
        { provide: GraphqlService, useValue: graphqlServiceMock },
        { provide: NzModalService, useValue: modalServiceMock },
        { provide: NzModalRef, useValue: modalServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddColumnModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
