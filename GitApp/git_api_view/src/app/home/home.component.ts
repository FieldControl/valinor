import { Component, Input, OnInit } from '@angular/core';
import { ApigitService } from '../services/apigit.service';
import { SharedDateService } from '../services/SharedData.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  textSeach:any
  cardsData:any
  constructor(private apiGit:ApigitService,private shareddata:SharedDateService){
   
  }

  ngOnInit(): void {
        this.shareddata.data$.subscribe(data => {
          debugger
          this.cardsData = data.items
        })
  }

}
