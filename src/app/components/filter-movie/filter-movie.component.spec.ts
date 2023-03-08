import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterMovieComponent } from './filter-movie.component';

describe('FilterMovieComponent', () => {
  let component: FilterMovieComponent;
  let fixture: ComponentFixture<FilterMovieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterMovieComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FilterMovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
