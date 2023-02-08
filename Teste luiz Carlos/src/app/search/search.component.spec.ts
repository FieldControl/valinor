import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchComponent } from './search.component';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update login', () => {
    component.onInput('search')
    expect(component.login).toEqual('search')
  })

  it('should submit', () => {
    spyOn(component.search, 'emit');
    let preventDefault = function name(params: any) {}
    component.onSubmit({preventDefault})
    expect(component.search.emit).toHaveBeenCalledWith(component.login);
  })
});
