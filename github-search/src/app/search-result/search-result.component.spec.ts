import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SearchResultComponent } from './search-result.component';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RepositoryDetailsComponent } from '../repository-details/repository-details.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { AppModule } from '../app.module';

describe('SearchResultComponent', () => {
  let component: SearchResultComponent;
  let fixture: ComponentFixture<SearchResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        SearchResultComponent,
        SearchBarComponent,
        RepositoryDetailsComponent
      ],
      imports: [HttpClientTestingModule, FormsModule, AppModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display "No repositories found" message when repositories array is empty', () => {
    component.repositories = [];
    fixture.detectChanges();

    const noRepositoriesMessage = fixture.debugElement.query(By.css('.text-center h3'));
    expect(noRepositoriesMessage.nativeElement.textContent).toContain('No repositories found for the search');
  });

  it('should display repositories when repositories array is not empty', () => {
    const repositories = [
      { name: 'repo1', owner: { login: 'user1' }, description: 'Description 1', html_url: 'url1', language: 'JavaScript', watchers_count: 10, stargazers_count: 20, open_issues_count: 5, topics: ['topic1', 'topic2'] },
      { name: 'repo2', owner: { login: 'user2' }, description: 'Description 2', html_url: 'url2', language: 'TypeScript', watchers_count: 15, stargazers_count: 30, open_issues_count: 3, topics: ['topic3'] },
    ];
    component.repositories = repositories;
    fixture.detectChanges();

    const repoCards = fixture.debugElement.queryAll(By.css('.card-custom'));
    expect(repoCards.length).toBe(repositories.length);
  });

  it('should display repository details when viewingIssues is true', fakeAsync(() => {
    const issues = [{ title: 'Issue 1' }, { title: 'Issue 2' }];
    component.viewingIssues = true;
    component.selectedRepoIssues = issues;
    component.repoName = 'repo1';
    fixture.detectChanges();

    const repositoryDetailsComponent = fixture.debugElement.query(By.directive(RepositoryDetailsComponent));
    expect(repositoryDetailsComponent).toBeTruthy();
  }));
});
