import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnComponent } from './column.component';
import { provideHttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ColumnService } from '../../services/column.service';

describe('ColumnComponent', () => {
  let component: ColumnComponent;
  let fixture: ComponentFixture<ColumnComponent>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockColumnService: jasmine.SpyObj<ColumnService>

  beforeEach(async () => {
    mockDialog = jasmine.createSpyObj('MatDialog', ['open'])
    mockColumnService = jasmine.createSpyObj('ColumnService', ['deleteColumn'])

    await TestBed.configureTestingModule({
      imports: [ColumnComponent],
      providers: [
        provideHttpClient(),
        { provide: MatDialog, useValue: mockDialog },
        { provide: ColumnService, useValue: mockColumnService },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnComponent);
    component = fixture.componentInstance;

    component.column = {
      id: 1,
      Cards: [],
      name: 'Test'
    }

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call editColumn and open dialog', () => {
    component.editColumn(component.column);
    expect(mockDialog.open).toHaveBeenCalled();
  })

  it('should call addCard and open dialog', () => {
    component.addCard(component.column);
    expect(mockDialog.open).toHaveBeenCalled();
  })

  it('should call deleteColumn and invoke columnService', () => {
    component.deleteColumn(component.column);
    expect(mockColumnService.deleteColumn).toHaveBeenCalledWith(component.column.id)
  })
});
