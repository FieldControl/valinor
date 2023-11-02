import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { GithubService } from 'src/app/services/githubService/github-service.service';

import { PesquisaComponent } from './pesquisa.component';
import { IconsModule } from 'src/app/icons/icons.module';
import { FormsModule } from '@angular/forms';

describe('PesquisaComponent', () => {
  let component: PesquisaComponent;
  let fixture: ComponentFixture<PesquisaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PesquisaComponent],
      providers: [GithubService, ToastrService],
      imports: [ToastrModule.forRoot(), IconsModule, FormsModule],
    });
    fixture = TestBed.createComponent(PesquisaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onSearch deve chamar searchRepositorio', () => {
    const githubService = TestBed.inject(GithubService);
    const toastrService = TestBed.inject(ToastrService);

    spyOn(githubService, 'searchRepositorios').and.returnValue(
      Promise.resolve('result')
    );
    spyOn(toastrService, 'error');
    
    component.query = 'searchQuery';
    component.onSearch();

    expect(githubService.searchRepositorios).toHaveBeenCalledWith('searchQuery');
    expect(githubService.page).toBe(1);
    expect(toastrService.error).not.toHaveBeenCalled();
  });
});