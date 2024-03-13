import { TestBed } from '@angular/core/testing';

import { BadgeService } from './badge.service';
import { Badge } from '../models/badge';
import { environment } from 'src/environments/environment';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('BadgeService', () => {
  let service: BadgeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BadgeService]
    });
    service = TestBed.inject(BadgeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve a list of badges', () => {
    const mockBadges: Badge[] = [
      { id: '1', name: 'Badge 1', color: '#ff0000' },
      { id: '2', name: 'Badge 2', color: '#00ff00' },
      { id: '3', name: 'Badge 3', color: '#0000ff' }
    ];

    service.list().subscribe(badges => {
      expect(badges).toBeTruthy();
      expect(badges.length).toBe(3);
      expect(badges).toEqual(mockBadges);
    });

    const req = httpMock.expectOne(`${environment.baseApiUrl}/badges`);
    expect(req.request.method).toBe('GET');
    req.flush(mockBadges);
  });
});
