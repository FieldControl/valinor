import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { SearchComponent } from './search.component';
import { FormsModule } from '@angular/forms';
import { Repository } from 'src/app/models/repository';

describe('SearchComponent', () => {

  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchComponent],
      imports: [HttpClientTestingModule, FormsModule]
    });
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function createRepository(
    name: string,
    ownerLogin: string,
    description: string,
    pushedAt: string,
    stargazersCount: number,
    language: string,
    topics: string[]
  ): Repository {
    const owner = { login: ownerLogin, avatar_url: 'https://example.com/avatar.png' };
    return {
      total_count: 1,
      items: [
        {
          name,
          owner,
          full_name: `${ownerLogin}/${name}`,
          html_url: `https://github.com/${ownerLogin}/${name}`,
          description,
          pushed_at: pushedAt,
          stargazers_count: stargazersCount,
          language,
          topics,
        },
      ],
    };
  }

  it('should create the SearchComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should display "No Description" when description is EMPTY', () => {
    //Arrange: Definição das variáveis necessárias para o teste.
    component.repositories = createRepository('kaiogotyacode', 'kaiogotyacode', '', '2023-11-20T13:34:55Z', 0, '', ['']);

    //Act: EXECUTAR o método de busca e DETECTAR mudanças para evitar problemas com Ordem de Renderização ao acessar o DOM.
    component.searchRepo();
    fixture.detectChanges();

    //Assert: Validar se o textContent deste elemento contém "No Description"    
    const descriptionElement = HTMLElement = fixture.nativeElement.querySelector('.description');
    expect(descriptionElement.textContent).toContain('No description');

  });

  it('should display "Not specified" when Language is EMPTY ', () => {
    //Arrange
    component.repositories = createRepository('kaiogotyacode', 'kaiogotyacode', '', '2023-11-20T13:34:55Z', 0, '', ['']);

    //Act
    component.searchRepo();
    fixture.detectChanges();

    //Assert
    const languageElement = HTMLElement = fixture.nativeElement.querySelector('.language');
    expect(languageElement.textContent).toContain('Not specified');
  });

  it('should display "13.4k" when stargazersCount is equal to 13400', () => {
    //Arrange
    component.repositories = createRepository('kaiogotyacode', 'kaiogotyacode', 'simple description', '2023-11-20T13:34:55Z', 13400, '', ['']);

    //Act
    component.searchRepo();
    fixture.detectChanges();

    //Assert
    const languageElement = HTMLElement = fixture.nativeElement.querySelector('.stargazers');
    expect(languageElement.textContent).toContain('13.4k');
  });

  it('should display "735" when stargazersCount is equal to 735', () => {
    //Arrange
    component.repositories = createRepository('kaiogotyacode', 'kaiogotyacode', 'simple description', '2023-11-20T13:34:55Z', 735, '', ['']);

    //Act
    component.searchRepo();
    fixture.detectChanges();

    //Assert
    const languageElement = HTMLElement = fixture.nativeElement.querySelector('.stargazers');
    expect(languageElement.textContent).toContain('735');
  });

});
