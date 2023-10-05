import { Component, OnInit } from '@angular/core';
import { ListService } from './list.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  
  api:any = [];
  page: any
  boolean = false;
  isLoading = true;
  
  public number: number = 1
  
  constructor(private listService: ListService) {}
  
  ngOnInit() {
    this.listService.getAPI(this.number).subscribe(
      response => { 
        this.isLoading = false;
        this.api = response
      },
        (error) => {
        console.error('Erro ao buscar dados da API', error);
        this.isLoading = true; 
      }
    )
  }

  // módulo 1 - da aplicação!

  afterPage(){
    if(this.number > this.api.totalPages){
      console.log('Número abaixo do esperado!')
    }else{
      this.number++
      this.listService.getAPI(this.number).subscribe(
        response => { this.api = response
      });
    }
  }

  previousPage(){
    if(this.number <= 0){
      console.log('Número abaixo do esperado!')
    }else{
      this.number--
      this.listService.getAPI(this.number).subscribe(
        response => { this.api = response
      });
    }
  }
  
  // módulo 2 - da aplicação!
  
  searchPage(){
    if(this.page === "" || undefined === this.page){
      console.log('O espaço de busca está em branco!')
    }else{
      this.number = 1
      this.listService.getAPISearch(this.page, this.number).subscribe(
        response => { this.api = response
      });
    }
  }

  queryPage(){
    this.boolean = true
  }
}

