import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { apiService } from './service.service';

describe('apiService', () => {
  let service: apiService;
  let HttpClient1: HttpClient
  let HttpTestingControlle: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [apiService],
    });
    service = TestBed.inject(apiService);
    HttpClient1 = TestBed.inject(HttpClient)
    HttpTestingControlle = TestBed.inject(HttpTestingController);


  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be created', async () => {
    const service: apiService = await TestBed.get(apiService);
    expect(service).toBeTruthy();
  });
  it('teste', async () => {
    const res = await service.loadAgents()
    console.log(res)
    expect(res).toBeTruthy()
  });

  it('Getting from API', () => {
    const mockReq = HttpTestingControlle.expectOne(service.agentsUrl)
    expect(mockReq.request.method).toBe('GET')
  })
})