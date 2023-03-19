import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchRepositoriesComponent } from './search-repositories.component';

describe('SearchRepositoriesComponent', () => {
  let component: SearchRepositoriesComponent;
  let fixture: ComponentFixture<SearchRepositoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchRepositoriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchRepositoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit search event', () => {
    const value = 'angular';
    const spy = spyOn(component.emmitSearch, 'emit');
    component.submitForm(value);
    expect(spy).toHaveBeenCalledWith(value);
  });
});
