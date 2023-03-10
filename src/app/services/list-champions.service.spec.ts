import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ListChampionService } from './list-champion.service';

describe('ListChampionService', () => {
    let httpClient: HttpClient
    let httpTestingController: HttpTestingController
  let service: ListChampionService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ListChampionService], imports: [HttpClientTestingModule]})
    httpClient = TestBed.inject(HttpClient)
    httpTestingController = TestBed.inject(HttpTestingController)
    service = TestBed.inject(ListChampionService)
  });

  afterEach(() => {
    httpTestingController.verify()
  })

  it('#getChampions - Deve buscar todos os campeões paginados como esperado', (done: DoneFn) => {
    const expected = [
        {
          id: 'Ahri',
          key: '103',
          name: 'Ahri',
          title: 'a Raposa de Nove Caudas',
        },
        {
          id: 'Ahri',
          key: '103',
          name: 'Ahri',
          title: 'a Raposa de Nove Caudas',
        },
        {
          id: 'Ahri',
          key: '103',
          name: 'Ahri',
          title: 'a Raposa de Nove Caudas',
        },
        {
          id: 'Ahri',
          key: '103',
          name: 'Ahri',
          title: 'a Raposa de Nove Caudas',
        },
        {
          id: 'Ahri',
          key: '103',
          name: 'Ahri',
          title: 'a Raposa de Nove Caudas',
        },
        {
          id: 'Ahri',
          key: '103',
          name: 'Ahri',
          title: 'a Raposa de Nove Caudas',
        }
      ]

    service.getChampions(1, 6).subscribe({
      next: (response) => {
        expect(response)
          .toEqual({ totalCount: 162, champions: [{
            id: 'Ahri',
            key: '103',
            name: 'Ahri',
            title: 'a Raposa de Nove Caudas',
          } as any,
          {
            id: 'Ahri',
            key: '103',
            name: 'Ahri',
            title: 'a Raposa de Nove Caudas',
          },
          {
            id: 'Ahri',
            key: '103',
            name: 'Ahri',
            title: 'a Raposa de Nove Caudas',
          },
          {
            id: 'Ahri',
            key: '103',
            name: 'Ahri',
            title: 'a Raposa de Nove Caudas',
          },
          {
            id: 'Ahri',
            key: '103',
            name: 'Ahri',
            title: 'a Raposa de Nove Caudas',
          },
          {
            id: 'Ahri',
            key: '103',
            name: 'Ahri',
            title: 'a Raposa de Nove Caudas',
          }] 
        });
        done();
      },
    });


   const req = httpTestingController.expectOne('http://localhost:3000/champions?_page=1&_limit=6')
   req.flush({
    headers: {
        'x-total-count': '162'
    },
    expected
   })
  });
});