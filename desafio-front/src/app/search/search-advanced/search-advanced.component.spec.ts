import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchAdvancedComponent } from './search-advanced.component';


describe('SearchAdvancedComponent', () => {
  let component: SearchAdvancedComponent;
  let fixture: ComponentFixture<SearchAdvancedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchAdvancedComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
