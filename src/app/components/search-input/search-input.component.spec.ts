import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchInputComponent } from './search-input.component';
import { NgIconsModule } from '@ng-icons/core';

import {
  heroMagnifyingGlass,
  heroXCircle,
  heroStar,
} from '@ng-icons/heroicons/outline';

describe('SearchInputComponent', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;
  let mockRouter: any;
  let mockActivatedRoute: any;

  beforeEach(() => {
    mockRouter = {
      url: '/',
      navigate: jasmine.createSpy('navigate'),
    };

    mockActivatedRoute = {
      queryParams: {
        subscribe: jasmine
          .createSpy('subscribe')
          .and.callFake((fn: (value: any) => void) => {
            fn({ searchTerm: '' });
          }),
      },
    };

    TestBed.configureTestingModule({
      declarations: [SearchInputComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        NgIconsModule.withIcons({ heroMagnifyingGlass, heroXCircle, heroStar }),
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    });

    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set form value and searchTerm on ngOnInit', () => {
    component.ngOnInit();
    expect(component.form.value).toBe('');
    expect(component.searchTerm).toBe('');
  });

  it('should reset form onErase', () => {
    component.form.setValue('sample search');
    component.onErase();
    expect(component.form.value).toBe(null);
  });

  it('should navigate and send the search term to the results route with the enter key', () => {
    component.form.setValue('sample search');
    component.onSearch({ key: 'Enter' } as KeyboardEvent);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/results'], {
      queryParams: {
        searchTerm: 'sample search',
      },
    });
  });


  it('should not navigate onSearch with empty form value', () => {
    component.form.setValue('');
    component.onSearch({ key: 'Enter' } as KeyboardEvent);

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
