import { Component, Input, OnInit } from '@angular/core';
import { RepositorioService } from 'src/app/services/repositorio.service';
import { NumberPipe } from 'src/app/number.pipe';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  repositorios: any; 
  
  constructor(private repositorioService: RepositorioService){}
  
  @Input() search!: string;
  public homePage = 1;

  Search(){
    return this.search;
  }

  repositorioResposta(){
    if (this.Search() === undefined){
      window.alert('Você não me parece muito certo sobre o que quer pesquisar...')
    } else {
      this.repositorioService.getSearch(this.Search()).subscribe({

        next: (data: any) => {
          console.log((this.repositorios = data.items));
        },
        error: error => {
          console.log(error);
        }
      });
    }
  }

  ngOnInit(): void {}

}
