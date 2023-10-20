import { Component } from '@angular/core';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { ApigitService } from '../services/apigit.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  faBars = faBars
  textSeach:any
  cardsData:any
  constructor(private apiGit:ApigitService){
    
  }

  

}
