import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryComponent } from './query.component';

describe('QueryComponent', () => {
  let component: QueryComponent;
  let fixture: ComponentFixture<QueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QueryComponent]
    });
    fixture = TestBed.createComponent(QueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
