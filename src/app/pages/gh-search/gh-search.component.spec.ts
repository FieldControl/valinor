import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GitHubSearchComponent } from './gh-search.component';

describe('GitHubSearchComponent', () => {
  let component: GitHubSearchComponent;
  let fixture: ComponentFixture<GitHubSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        BrowserAnimationsModule,
        HttpClientTestingModule
      ],
      declarations: [ GitHubSearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GitHubSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
