import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home.component';
import { SearchInputComponent } from './../../components/search-input/search-input.component';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';

import {
  heroMagnifyingGlass,
  heroXCircle,
  heroStar,
} from '@ng-icons/heroicons/outline';
import { ReactiveFormsModule } from '@angular/forms';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(waitForAsync(() => {
    const mockRouter = {
      url: '/',
      navigate: jasmine.createSpy('navigate'),
    };

    const mockActivatedRoute = {
      queryParams: {
        subscribe: jasmine
          .createSpy('subscribe')
          .and.callFake((fn: (value: any) => void) => {
            fn({ searchTerm: '' });
          }),
      },
    };

    TestBed.configureTestingModule({
      declarations: [HomeComponent, SearchInputComponent],
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        NgIconsModule.withIcons({ heroMagnifyingGlass, heroXCircle, heroStar }),
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display GitHub header', () => {
    const headerElement: HTMLElement =
      fixture.nativeElement.querySelector('h1');
    expect(headerElement.textContent).toContain('GitHub');
  });

  it('should display search input', () => {
    const searchInput = fixture.nativeElement.querySelector('app-search-input');
    expect(searchInput).toBeTruthy();
  });

  it('should display the illustration', () => {
    const illustrationImg = fixture.nativeElement.querySelector('img');
    expect(illustrationImg).toBeTruthy();
  });
});
