import { Component} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EmojiConvertor } from 'emoji-js';
import { DomSanitizer } from '@angular/platform-browser'

type Result = {
  total_count: number,
  incomplete_results: boolean,
  items: Array<any>;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  //Declarando os atributos da classe:

  title: string = "desafio-fieldcontrol";

  url: string = "https://api.github.com/search/repositories?q=$search_value&per_page=10&page=$page_value";
  
  usuarioPesquisou: boolean = false;
  loading: boolean = false;

  result: Result = {total_count: 0, incomplete_results: false, items: []};
  searchValue: string = "";
  currentPage: string = "1";
  maxPage: string = "";
  pagesArray: Array<string> = [];

  constructor(private http: HttpClient, private sanitizer: DomSanitizer){}

  onEnter(value: string): void{
    //Função que executa quando o usuário aperta 'Enter' na barra de pesquisa.

    this.currentPage = '1';

    if(value.length > 0){
      this.loading = true;

      this.searchValue = value;

      this.http.get<Result>(this.url.replace('$search_value', value).replace('$page_value', '1')).subscribe(data => {
        this.result = data;
        this.usuarioPesquisou = true;

        var maxPage = 100;

        if(this.result.total_count < 1000) maxPage = Math.ceil(this.result.total_count / 10);

        this.maxPage = maxPage.toString();

        if(maxPage <= 8) this.pagesArray = Array.from({length: maxPage}, (_, i) => i + 1).map(String); 

        else{
          this.pagesArray = Array.from({length: 5}, (_, i) => i + 1).map(String).concat(['...', maxPage.toString()]);
        }

        this.loading = false;
      });
    }
    else{
      this.resetSearch();
    }
  }

  loadPage(page: string): void{
    //Função executada quando o usuário muda de página.
    //A sequência de 'if' e 'else' é para gerar a lista de elementos na paginação.
    //Como tem vários casos diferentes, foi necessário utilizar várias estruturas condicionais.

    var maxPage = 100;

    if(this.result.total_count < 1000) maxPage = Math.ceil(this.result.total_count / 10);

    this.maxPage = maxPage.toString();
    
    if(page == '0' || page == '...' || page == (maxPage +1 ).toString()) return;

    var maxLength = 5;

    if(maxPage < 5) maxLength = maxPage;

    if(maxPage <= 8) this.pagesArray = Array.from({length: maxPage}, (_, i) => i + 1).map(String); 

    else if(+page <= +'3'){

      if(maxPage < 5) {
        this.pagesArray = Array.from({length: maxLength}, (_, i) => i + 1).map(String);
      }
      else{
        this.pagesArray = Array.from({length: maxLength}, (_, i) => i + 1).map(String).concat(['...', maxPage.toString()]);
      }

    }
      
    else if(+page <= +'6'){
      if(maxPage <= 8){
        this.pagesArray = Array.from({length: +page -maxPage}, (_, i) => i + 1).map(String);
      }
      else{
        this.pagesArray = Array.from({length: +page +2}, (_, i) => i + 1).map(String).concat(['...', maxPage.toString()]);
      }
    
    } 

    else if(+page == maxPage){
      this.pagesArray = ['1','...',(maxPage - 5).toString(), (maxPage - 4).toString(), (maxPage - 3).toString(), (maxPage - 2).toString(), (maxPage - 1).toString(), (maxPage).toString()];
    }
    
    else if( (+page == maxPage - 2) || (+page == maxPage - 1)){
      this.pagesArray = ['1','...'].concat(Array.from({length: maxLength},(v,k)=>k + +maxPage - 4).map(String));
    }

    else {
      this.pagesArray = ['1','...'].concat(Array.from({length: maxLength},(v,k)=>k + +page -2).map(String)).concat('...', maxPage.toString());
    }

    this.loading = true;

    this.http.get<Result>(this.url.replace('$search_value', this.searchValue).replace('$page_value', page)).subscribe(data => {
      this.result = data;
      this.loading = false;
    });

    this.currentPage = page;

  }

  resetSearch(): void{
    //Recarrega a página.

    this.loading = true;
    window.location.reload();
    this.loading = false;
  }

  numberWithPoints(n: number){
    //Formata o resultado total de repositórios encontrados para notação brasileira.
    //Exemplo: 1347879 ==> 1.347.879

    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  stringWithEmoji(str: string){
    //Formata uma string para converte emojis no formato :emoji: para unicode.

    if(str != null){
      var emoji = new EmojiConvertor();
      emoji.replace_mode = 'unified';
      emoji.allow_native = true;
      return emoji.replace_colons(str);
    }
    else{
      return str;
    }
  }

  updatedAt(dateUpdatedString: string){
    //Pega o ano, mês e dia da última atualização do repositório no resultado da consulta na api.

    return `${dateUpdatedString.slice(8,10)}/${dateUpdatedString.slice(5,7)}/${dateUpdatedString.slice(0,4)}`
  }

  emphasizeFullName(user: string, repo: string){
    //Destaca a string pesquisada no nome do repositório.
    
    const regexp = new RegExp (`(${this.searchValue})`, "gi");
    
    return this.sanitizer.bypassSecurityTrustHtml(`${user}/${repo.replace(regexp, `<em style="font-style: normal; font-weight: 650">$1</em>`)}`);
    
    
  }

  emphasizeDescription(des: string){
    //Destaca a string pesquisada na descrição do repositório.
    
    if(des != null){
      const regexp = new RegExp (`(${this.searchValue})`, "gi");
      return this.sanitizer.bypassSecurityTrustHtml(des.replace(regexp, `<em style="font-style: normal; font-weight: 650">$1</em>`));
    }
    else{
      return des;
    }
    
  }

  getStargazersUrl(item: any){
    //Retorna o link de todos os usuários stargazers.

    return `https://github.com/${item.owner.login}/${item.name}/stargazers`
  }

  getIssuesUrl(item: any){
    //Retorna o link das issues do repositório.

    return `https://github.com/${item.owner.login}/${item.name}/issues`
  }

}
