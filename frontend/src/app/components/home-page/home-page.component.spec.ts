import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomePageComponent } from './home-page.component';
import { GitRepoService } from 'src/services/service-repo-git.service';
import { of } from 'rxjs';

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;
  let mockGitRepoService: Partial<GitRepoService>;

  beforeEach(async () => {
    mockGitRepoService = {
      searchRepositories: jasmine
        .createSpy('searchRepositories')
        .and.returnValue(of({ items: [] })),
    };

    await TestBed.configureTestingModule({
      declarations: [HomePageComponent],
      providers: [{ provide: GitRepoService, useValue: mockGitRepoService }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call searchRepositories on searchRepositories()', () => {
    component.query = 'example';
    component.searchRepositories();
    expect(mockGitRepoService.searchRepositories).toHaveBeenCalledWith(
      'example',
      1,
      10
    );
  });

  it('should call searchRepositories on loadMoreRepositories()', () => {
    component.query = 'example';
    component.loadMoreRepositories();
    expect(mockGitRepoService.searchRepositories).toHaveBeenCalledWith(
      'example',
      component.page,
      10
    );
  });

  it('should decrement page and call loadMoreRepositories on previousPage()', () => {
    component.page = 3;
    spyOn(component, 'loadMoreRepositories');
    component.previousPage();
    expect(component.page).toBe(2);
    expect(component.loadMoreRepositories).toHaveBeenCalled();
  });

  it('should increment page and call loadMoreRepositories on nextPage()', () => {
    component.page = 2;
    spyOn(component, 'loadMoreRepositories');
    component.nextPage();
    expect(component.page).toBe(3);
    expect(component.loadMoreRepositories).toHaveBeenCalled();
  });
});
