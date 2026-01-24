import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Columns } from './columns';

describe('Columns', () => {
  let component: Columns;
  let fixture: ComponentFixture<Columns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Columns]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Columns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
