import { TestBed } from '@angular/core/testing';

import { OrderDetailsService } from './order-details.service';

describe('OrderDetailsService', () => {
  let service: OrderDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
