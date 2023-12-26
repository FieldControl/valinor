import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, Observable } from 'rxjs';

import { RepoComponent } from './repo.component';
import { GithubService } from '../../services/github/github.service';
import { MatIconModule } from '@angular/material/icon';
import { PaginationModule } from '../pagination/pagination.module';
import { RepoCardComponent } from '../repo-card/repo-card.component';

describe('RepoComponent', () => {
  let component: RepoComponent;
  let fixture: ComponentFixture<RepoComponent>;
  let mockGithubService: jasmine.SpyObj<GithubService>;

  beforeEach(() => {
    mockGithubService = jasmine.createSpyObj('GithubService', ['getRepos']);

    TestBed.configureTestingModule({
      declarations: [RepoComponent, RepoCardComponent],
      imports: [
        HttpClientTestingModule,
        MatIconModule,
        PaginationModule
      ],
      providers: [{ provide: GithubService, useValue: mockGithubService }]
    });

    fixture = TestBed.createComponent(RepoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RepoCardComponent);
    const component = fixture.componentInstance;

    component.repo = { id: 1, name: 'Repo 1', private: true, description: 'Repos description', owner: { login: 'user' } };

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should load repositories on init', () => {
    const mockRepos = [{ id: 1, name: 'Repo 1', private: true, description: 'Repos description', owner: { login: 'user' } }, { id: 2, name: 'Repo 2', private: true, description: 'Repos description', owner: { login: 'user' } }];

    mockGithubService.getRepos.and.returnValue(of({ items: mockRepos, total_count: 2 }));

    fixture.detectChanges();

    expect(component.repos).toEqual(mockRepos);
    expect(component.totalItems).toEqual(2);
  });

  it('should handle error when loading repositories', () => {
    const errorMessage = 'An error occurred while fetching repositories.';

    mockGithubService.getRepos.and.returnValue(
      new Observable((observer) => {
        observer.error({ status: 500, statusText: 'Internal Server Error' });
      })
    );

    fixture.detectChanges();

    expect(component.repos).toEqual([]);
    expect(component.totalItems).toEqual(0);
    expect(component.error).toEqual(errorMessage);
  });
});