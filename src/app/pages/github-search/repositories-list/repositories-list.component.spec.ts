import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { RepositoriesListComponent } from './repositories-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { GithubService } from '../../services/github.service';
import { of } from 'rxjs';
import { Repositories } from 'src/app/models/repositories.model';



describe('RepositoriesListComponent', () => {
  let component: RepositoriesListComponent;
  let fixture: ComponentFixture<RepositoriesListComponent>;
  let githubService: GithubService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserTestingModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatCardModule,
        MatChipsModule,
        MatPaginatorModule,
        MatTooltipModule,
        FormsModule
      ],
      declarations: [RepositoriesListComponent],
      providers: [GithubService]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RepositoriesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    githubService = TestBed.inject(GithubService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain a search bar', () => {
    const searchBar = fixture.nativeElement.querySelector('search-bar');
    expect(searchBar).toBeDefined();
  });

  it('should contain a button', () => {
    const button = fixture.nativeElement.querySelector(('button'));
    expect(button).toBeDefined();
  });

  it('should update the search term', () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(('input'));
    const term = 'Angular';
    input.value = term;
    input.dispatchEvent(new Event('input'));
    expect(component.searchTerm).toBe(term);
  });

  it('should call preencheLista method on button click', () => {
    spyOn(component, 'preencheLista');
    const button = fixture.nativeElement.querySelector(('button'));
    button.click();
    expect(component.preencheLista).toHaveBeenCalled();
  });

  it('should create a list of repositories', () => {
    spyOn(githubService, 'getRepositories').and.returnValue(
      of({
        total_count: 1,
        incomplete_results: false,
        items: [
          {
            id: 1,
            full_name: 'arthur/field',
            owner: {
              login: 'arthur',
              avatar_url: 'avatar.com/avatar'
            },
            description: 'teste',
            topics: ['angular'],
            language: 'TypeScript',
            stargazers_count: 1,
            open_issues: 0,
            forks: 0,
            html_url: 'https://github.com/arthur/field',
          }
        ],
      } as Repositories)
    );

    component.preencheLista(1);

    expect(githubService.getRepositories).toHaveBeenCalled();
    expect(component.repositorios.items.length).toBe(1);
  });
});
