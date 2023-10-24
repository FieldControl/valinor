import { Component, Input, OnInit } from '@angular/core';
import { ApigitService } from '../../services/apigit.service';
import { SharedDateService } from '../../services/SharedData.service';
import { faChevronLeft,faChevronRight } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  cardsData:any = []
  constructor(private apiGit:ApigitService,private SharedData:SharedDateService){
   
  }

  paginaAtual = 1;
  itensPorPagina = 2;
  iconLeft = faChevronLeft
  iconRight = faChevronRight
  ngOnInit(): void {
        this.SharedData.dataCard$.subscribe(card => {
          this.cardsData = card
          
        })

        if(window.innerWidth < 500){
          this.itensPorPagina = 3
        }
  }
  
}
