import { TestBed } from '@angular/core/testing';

import { Task } from './task';

describe('Task', () => {
  let service: Task;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Task);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
