import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RepositoryDetailsComponent } from './repository-details.component';

describe('RepositoryDetailsComponent', () => {
  let component: RepositoryDetailsComponent;
  let fixture: ComponentFixture<RepositoryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RepositoryDetailsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RepositoryDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display issue details', () => {
    const issues = [
      {
        title: 'Issue 1',
        html_url: 'https://github.com/user/repo/issues/1',
        user: { login: 'user1' },
        created_at: '2023-08-20T10:00:00Z',
        comments: 3,
        updated_at: '2023-08-20T12:00:00Z'
      }
    ];
    const repoName = 'user/repo';

    component.issues = issues;
    component.repoName = repoName;
    fixture.detectChanges();

    const issueElement = fixture.nativeElement.querySelector('.card-custom');
    expect(issueElement.textContent).toContain('#1');
    expect(issueElement.textContent).toContain('Issue 1');
    expect(issueElement.textContent).toContain('by: user1');
    expect(issueElement.textContent).toContain('created at: 2023-08-20T10:00:00Z');
    expect(issueElement.textContent).toContain('comments: 3');
    expect(issueElement.textContent).toContain('last commented at: 2023-08-20T12:00:00Z');
  });
});
