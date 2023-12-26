import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { GithubService } from './services/github/github.service';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from './components/header/header.component';
import { PaginationModule } from './components/pagination/pagination.module';
import { RepoComponent } from './components/repo/repo.component';
import { RepoCardComponent } from './components/repo-card/repo-card.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule,
        MatIconModule,
        PaginationModule
      ],
      declarations: [
        AppComponent,
        HeaderComponent,
        RepoComponent,
        RepoCardComponent
      ],
      providers: [GithubService]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'test-bruna'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('test-bruna');
  });
});