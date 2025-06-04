import { TestBed } from '@angular/core/testing';

import { Card } from './card';

describe('Card', () => {
  let service: Card;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Card);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
