import { TestBed } from '@angular/core/testing';
import { ColumnService } from './column.service';
import { Apollo } from 'apollo-angular';
import { of } from 'rxjs';
import { CREATE_COLUMN, GET_ALL_COLUMNS, DELETE_COLUMN } from '../graphql/column-queries-mutations';

describe('Serviço ColumnService', () => {
  let service: ColumnService;
  let mockApollo: Partial<Apollo>;

  beforeEach(() => {
    mockApollo = {
      mutate: jasmine.createSpy('mutate').and.returnValue(of({ data: { createColumn: { id: '1', name: 'Nova Coluna', color: 'red' } } })),
      watchQuery: jasmine.createSpy('watchQuery').and.returnValue({
        valueChanges: of({
          data: {
            getAllColumns: [
              { id: '1', name: 'Coluna 1', color: 'red' },
              { id: '2', name: 'Coluna 2', color: 'blue' },
            ],
          },
        }),
      }),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: Apollo, useValue: mockApollo }],
    });

    service = TestBed.inject(ColumnService);
  });

  it('deve criar o serviço', () => {
    expect(service).toBeTruthy();
  });

  it('deve criar uma nova coluna', (done) => {
    service.createColumn('Nova Coluna', 'red').subscribe((result) => {
      expect(mockApollo.mutate).toHaveBeenCalledWith(jasmine.objectContaining({
        mutation: CREATE_COLUMN,
        variables: { name: 'Nova Coluna', color: 'red' },
      }));
      expect(result).toEqual({ createColumn: { id: '1', name: 'Nova Coluna', color: 'red' } });
      done();
    });
  });

  it('deve buscar todas as colunas', (done) => {
    service.getAllColumns().subscribe((columns) => {
      expect(mockApollo.watchQuery).toHaveBeenCalledWith(jasmine.objectContaining({
        query: GET_ALL_COLUMNS,
      }));
      expect(columns).toEqual([
        { id: '1', name: 'Coluna 1', color: 'red' },
        { id: '2', name: 'Coluna 2', color: 'blue' },
      ]);
      done();
    });
  });

  it('deve deletar uma coluna', (done) => {
    const mockUpdateCache = jasmine.createSpy('updateCache');
    (mockApollo.mutate as jasmine.Spy).and.returnValue(of({}));

    service.deleteColumn('1').subscribe(() => {
      expect(mockApollo.mutate).toHaveBeenCalledWith(jasmine.objectContaining({
        mutation: DELETE_COLUMN,
        variables: { id: '1' },
        update: jasmine.any(Function),
      }));
      done();
    });
  });
});
