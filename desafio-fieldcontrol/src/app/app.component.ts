import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EmojiConvertor } from 'emoji-js';

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

  url: string = "https://api.github.com/search/repositories?q=";
  
  usuarioPesquisou: boolean = false;
  loading: boolean = false;

  result: Result = {total_count: 0, incomplete_results: false, items: []};

  constructor(private http: HttpClient){}

  title = 'desafio-fieldcontrol';

  onEnter(value: string): void{

    if(value.length > 0){
      this.loading = true;

      this.http.get<Result>(this.url + value).subscribe(data => {
        this.result = data;
        this.usuarioPesquisou = true;
        this.loading = false;
      });
    }
    else{
      this.resetSearch();
    }
  }

  resetSearch(): void{
    this.loading = true;
    window.location.reload();
    this.loading = false;
  }

  numberWithPoints(n: number){
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  stringWithEmoji(str: string){
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

}
