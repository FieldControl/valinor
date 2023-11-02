import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GithubService } from 'src/app/services/githubService/github-service.service';
import { RepositorioListaComponent } from './repositorio-lista.component';
import { IconsModule } from 'src/app/icons/icons.module';

describe('RepositorioListaComponent', () => {
  let component: RepositorioListaComponent;
  let fixture: ComponentFixture<RepositorioListaComponent>;
  let githubService: GithubService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IconsModule],
      declarations: [RepositorioListaComponent],
      providers: [GithubService],
    });
    fixture = TestBed.createComponent(RepositorioListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    githubService = TestBed.inject(GithubService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onNextPage teste', () => {
    spyOn(githubService, 'searchRepositorios').and.returnValue(Promise.resolve());
    component.githubService.query = 'teste';
    component.githubService.page = 1;

    component.onNextPage();

    expect(githubService.page).toBe(2);
    expect(githubService.searchRepositorios).toHaveBeenCalledWith('teste');
  });

  it('onPrevPage teste', () => {
    spyOn(githubService, 'searchRepositorios').and.returnValue(Promise.resolve());
    component.githubService.query = 'teste';
    component.githubService.page = 2;

    component.onPrevPage();

    expect(githubService.page).toBe(1);
    expect(githubService.searchRepositorios).toHaveBeenCalledWith('teste');
  });

});
