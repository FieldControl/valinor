import { Component, Input } from '@angular/core';
import { ApigitService } from '../services/apigit.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  textSeach:any
  cardsData:any
  constructor(private apiGit:ApigitService){
    
  }

  blur(){
    if(this.textSeach != undefined){
      this.apiGit.getRepositoryAll(this.textSeach).subscribe(data => {
        this.cardsData = data;
        console.log(data)
      })
    }
  }
}
