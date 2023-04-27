import { Component, Inject } from '@angular/core';
import { ListService } from 'src/app/services/list.service';
import { item, message } from 'src/app/List';
import { HtmlParser } from '@angular/compiler';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'field';
  teste: number = 0
  results: item[] = []
  total: number = 0
  nome: string = ''
  page: number = 0
  msg:string = ''
  lastPage: number = 0
  atual: number = 0
  antes: number = this.atual-1
  move: number = 0
  maxpage: number = 10
  maxchange = [0, 1, 2]

  redirecionar(str: string) {
    return window.location.href = str;
  }
  repoMax(){
    if(this.maxpage > 2){
      return [-2, -1, 0, 1, 2]
    }else if(this.maxpage > 1){
      return [0, 1]
    }else{
      return [0]
    }
  }
  max(num: number){
    if(this.total > 20){
      if(num === 1){
        this.maxchange = [0, 1, 2]
      }else if(num > 1 && num < this.lastPage){
        this.maxchange = [-1, 0, 1]
      }else{
        this.maxchange = [-2, -1, 0]
      }
    }else if(this.total > 10){
      if(num === 1){
        this.maxchange = [0, 1]
      }else{
        this.maxchange = [-1, 0]
      }
        
    }else{
      this.maxchange = [0]
    }
    return this.maxchange
  }
  

  resetMsg(): void{
    this.msg = ''
    this.results = []
    const sairCont = document.getElementsByClassName('sairCont')[0]
    sairCont.classList.remove('sairCont')
  }
  scrollPage(num:number){
    if(num < 0 ){
      return num = this.maxpage + num
    }else{
      if (num > this.maxpage-1){
        num = num - Math.floor((num)/this.maxpage)*this.maxpage
      }
      return num
    }
  }
  async alterarRepo(num: number){
    while(document.getElementsByClassName('anterior').length > 0){
      document.getElementsByClassName('anterior')[0].classList.remove('anterior');
    }
    const mid = document.getElementsByClassName('mid')[0]
    mid.classList.remove('mid')
    setTimeout(() => {
      mid.classList.add('mid')
    }, 0)
    
    if (num> this.atual){
      const box = document.getElementsByClassName('box')[1]
      this.move = 0;
      (box as HTMLElement).style.width = '40em';
      (box as HTMLElement).style.height = '25em'
      setTimeout(() => {
        (box as HTMLElement).style.width = '';
        (box as HTMLElement).style.height = ''
        box.classList.add('anterior')
      }, 0);      
    }else{
      const box = document.getElementsByClassName('box')[3]
      this.move = -68.6;
      (box as HTMLElement).style.width = '40em';
      (box as HTMLElement).style.height = '25em'
      setTimeout(() => {
        (box as HTMLElement).style.width = '';
        (box as HTMLElement).style.height = ''
        box.classList.add('anterior')
      }, 0)
    }
    if(num >= 0){
      if (num > this.maxpage-1){
        num = num - Math.floor((num)/this.maxpage)*this.maxpage
      }
      this.atual = num
    }else{
        this.atual = this.maxpage + num
    }

    const move = document.getElementsByClassName('scroll')[0]
    move.classList.remove('move');
    (move as HTMLElement).style.left = this.move+'em'
    setTimeout(() => {
      (move as HTMLElement).style.left = ''
      move.classList.add('move')
    }, 0)
    
  }
  async submitForm(form: any) {
    if(form.value.nome !== ''){
      if(this.results.length === 0){
      this.nome = form.value.nome;
      this.page = 1
      this.atual = 0
      await this.atualizar()

    }else{
      this.nome = form.value.nome;
      const cont = document.getElementsByClassName('container')[0]
      cont.classList.add('sairCont')
      await setTimeout(() => {  
        this.atualizar();
        cont.classList.remove('sairCont');
        
      }, 900);
    }}
   
  }
 
  constructor(private listService: ListService){
  };
  
  
  async mudarPag(num: number){
    this.page = this.page + num
    if (this.page > 100){
      this.page = 100
    }else if(this.page <= 0){
      this.page = 1
    }
    
    const scroll = document.getElementsByClassName('scroll')[0]
    scroll.classList.remove('move')
    scroll.classList.add('sairScroll')
    
      
    setTimeout(async () => {
      await this.atualizar();
      setTimeout(()=>{
        this.atual = 0
        scroll.classList.remove('sairScroll');
        scroll.classList.add('entrarscroll');
        setTimeout(() => {scroll.classList.remove('entrarscroll')}, 1000)        
      }, 500)
      
    }, 1000)
    
    
  }
  async atualizar(){  
    if(this.nome !== ''){
      await this.listService.getAll(this.nome, this.page).subscribe((data) =>{
        if(typeof data === 'string'){
          this.msg = data; 
          this.results = []
        }else{
          this.total = data.total_count;
          if(this.total === 0){
            this.msg = 'Não achamos esse repositório'
            this.results = []
          }else{
            this.lastPag(data.total_count)
            this.results = data.items; 
            this.maxpage = this.total - 10*(this.page-1)
            if(this.maxpage > 10){
            this.maxpage = 10
            }}
        }
      }) 
      
      
    }
    
  }
  lastPag(total: number){
    if(total > 0){
      if(total/10 > 100){
        this.lastPage = 100
      }else {
        if(Math.floor(total/10) == total/10){
          this.lastPage = total/10
        }else{
          this.lastPage = Math.floor(total/10)+1
        }
      }
      }
  }
  
}
