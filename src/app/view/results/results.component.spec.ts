import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { GithubService } from 'src/app/services/github/github.service';
import { of } from 'rxjs';
import { ResultsComponent } from './results.component';
import { RepositoriesResponse } from 'src/interfaces/RepositoriesResponse';
import { NgIconsModule } from '@ng-icons/core';

import {
  heroMagnifyingGlass,
  heroXCircle,
  heroStar,
} from '@ng-icons/heroicons/outline';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { SearchInputComponent } from 'src/app/components/search-input/search-input.component';
import { EmptySearchComponent } from 'src/app/components/empty-search/empty-search.component';

describe('ResultsComponent', () => {
  let component: ResultsComponent;
  let fixture: ComponentFixture<ResultsComponent>;
  let mockActivatedRoute: any;
  let mockGithubService: any;

  beforeEach(waitForAsync(() => {
    mockActivatedRoute = {
      queryParams: of({ searchTerm: 'dasçkdlasçfjaskldjsakdjhauoiwqyeipowq' }),
    };

    mockGithubService = {
      getRepositories: jasmine.createSpy('getRepositories').and.returnValue(
        of({
          items: [],
        } as RepositoriesResponse)
      ),
    };

    TestBed.configureTestingModule({
      declarations: [
        ResultsComponent,
        SearchInputComponent,
        EmptySearchComponent,
      ],
      imports: [
        HttpClientModule,
        CommonModule,
        ReactiveFormsModule,
        NgxPaginationModule,
        NgIconsModule.withIcons({ heroMagnifyingGlass, heroXCircle, heroStar }),
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: GithubService, useValue: mockGithubService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set searchTerm from query params', () => {
    expect(component.searchTerm).toBe('dasçkdlasçfjaskldjsakdjhauoiwqyeipowq');
  });

  it('should call getRepositories on ngOnInit', () => {
    expect(mockGithubService.getRepositories).toHaveBeenCalledWith(
      'dasçkdlasçfjaskldjsakdjhauoiwqyeipowq'
    );
  });

  it('should fetch repositories data', () => {
    const mockResponse: RepositoriesResponse = {
      items: [],
    };

    mockGithubService.getRepositories.and.returnValue(of(mockResponse));

    component.getData();

    expect(component.repositories).toEqual(mockResponse.items);
    expect(component.totalCount).toBe(mockResponse.items.length);
    expect(component.isLoading).toBe(false);
  });
});
