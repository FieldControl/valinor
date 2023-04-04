import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositorieIssuesComponent } from './repositorie-issues.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GithubService } from '../../services/github.service';

import { of } from 'rxjs';
import { Issues } from 'src/app/models/issues.model';


describe('RepositorieIssuesComponent', () => {
  let component: RepositorieIssuesComponent;
  let fixture: ComponentFixture<RepositorieIssuesComponent>;
  let githubService: GithubService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatCardModule,
        MatChipsModule,
        MatPaginatorModule,
        MatTooltipModule,
      ],
      declarations: [RepositorieIssuesComponent],
      providers: [GithubService]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RepositorieIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    githubService = TestBed.inject(GithubService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain a button "Voltar"', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeDefined();
  });

  it('should have as title "usename/reponame" ', () => {
    component.username = 'arthur'
    component.reponame = 'teste'
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h2');
    expect(title.textContent).toContain('arthur/teste');
  });

  it('should come back to "list" if button was clicked', () => {
    const link = fixture.nativeElement.querySelector('button');
    expect(link.getAttribute('ng-reflect-router-link')).toBe('/list');
  });

  it('should create a list of issues', () => {
    component.username = 'arthur'
    component.reponame = 'teste'
    fixture.detectChanges();

    spyOn(githubService, 'getIssues').and.returnValue(
      of({
        total_count: 1,
        incomplete_results: false,
        items: [{}],
      } as Issues)
    );

    component.resgataIssues(1);

    expect(githubService.getIssues).toHaveBeenCalled();
    expect(component.issues.items.length).toBe(1);
  });
});
