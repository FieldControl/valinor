import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ColumnService } from './column.service';
import { environment } from '../../environment/environment';
import { Column } from '../Models/column.model';

describe('ColumnService', () => {
  let service: ColumnService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ColumnService]
    });
    service = TestBed.inject(ColumnService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a new column', () => {
    const newColumn: Column = {
      id: '1',
      title: 'New Column'
    };

    service.createColumn(newColumn).subscribe(column => {
      expect(column).toEqual(newColumn);
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}/columns`);
    expect(req.request.method).toBe('POST');
    req.flush(newColumn);
  });

  it('should update an existing column', () => {
    const updatedColumn: Column = {
      id: '1',
      title: 'Updated Column'
    };

    service.updateColumn(updatedColumn.id, updatedColumn).subscribe(column => {
      expect(column).toEqual(updatedColumn);
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}/columns/${updatedColumn.id}`);
    expect(req.request.method).toBe('PATCH');
    req.flush(updatedColumn);
  });

  it('should delete an existing column', () => {
    const columnId = '1';

    service.deleteColumn(columnId).subscribe(result => {
      expect(result).toBe(columnId);
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}/columns/${columnId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(columnId);
  });
});
