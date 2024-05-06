import { TestBed } from '@angular/core/testing';

import { MyKeanuListService } from './my-keanu-list.service';

describe('MyKeanuListService', () => {
  let service: MyKeanuListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyKeanuListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
