import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { apiService } from './service.service';

describe('apiService', () => {
  let service: apiService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [apiService],
    }); 
    service = TestBed.inject(apiService);
    httpMock = TestBed.inject(HttpTestingController);


  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be created', () => {
    const service: apiService = TestBed.get(apiService);
    expect(service).toBeTruthy();
  });


  it('Getting from API', async () => {
    const dados = service.loadTest()
    dados.subscribe((users: any) => {
      expect(users).toBeTruthy()
    })
    const mockReq = httpMock.expectOne('https://valorant-api.com/v1/agents/?isPlayableCharacter=true&language=pt-BR')
    expect(mockReq.request.method).toBe('GET')
  })
})
