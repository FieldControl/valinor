import { TestBed } from '@angular/core/testing';

import {
  ApolloTestingController,
  ApolloTestingModule,
} from 'apollo-angular/testing';
import { CookieService } from 'ngx-cookie-service';
import { CreateColumnRequest } from 'src/app/models/interface/column/request/CreateColumnRequest';
import { EditColumnRequest } from 'src/app/models/interface/column/request/EditColumnRequest';
import { ColumnsResponse } from 'src/app/models/interface/column/response/ColumnsResponse';
import { ColumnService } from './column.service';

describe('ColumnService', () => {
  let service: ColumnService;
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [ColumnService, CookieService],
    });
    service = TestBed.inject(ColumnService);
    controller = TestBed.inject(ApolloTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Get all columns', () => {
    it('should return all columns', () => {
      const mockColumns: Array<ColumnsResponse> = [
        { id: '1', title: 'Column 1' },
        { id: '2', title: 'Column 2' },
      ];

      service.getAllColumns().subscribe((columns) => {
        expect(columns).toEqual(mockColumns);
      });

      const op = controller.expectOne('GetAllColumns');

      op.flush({
        data: {
          columns: mockColumns,
        },
      });
    });
  });

  describe('Create column', () => {
    it('should possible to create a column', () => {
      const mockColumns: CreateColumnRequest = {
        title: 'new column',
      };

      const mockColumnReturn: ColumnsResponse = {
        id: '1',
        title: 'new column',
      };

      service.createColumn(mockColumns).subscribe((columns) => {
        expect(columns).toEqual(mockColumnReturn);
        expect(columns.id).toEqual(mockColumnReturn.id);
        expect(columns.title).toEqual(mockColumnReturn.title);
      });

      const op = controller.expectOne('CreateColumn');

      op.flush({
        data: {
          columns: mockColumnReturn,
        },
      });
    });
  });

  describe('Edit column', () => {
    it('should possible to edit a column', () => {
      const mockColumns: EditColumnRequest = {
        id: '1',
        title: 'edit column',
      };

      service.editColumn(mockColumns).subscribe((columns) => {
        expect(columns).toEqual(mockColumns);
        expect(columns.id).toEqual(mockColumns.id);
        expect(columns.title).toEqual(mockColumns.title);
      });

      const op = controller.expectOne('updateColumn');

      op.flush({
        data: {
          columns: mockColumns,
        },
      });
    });
  });

  describe('Delete column', () => {
    it('should possible to delete a column', () => {
      const id: string = '1';

      service.deleteColumn(id).subscribe((response) => {
        expect(response).toBeTrue();
      });

      const op = controller.expectOne('deleteColumn');

      op.flush({
        data: {
          response: true,
        },
      });
    });
  });
});
