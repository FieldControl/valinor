import { Component } from '@angular/core';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { ApigitService } from '../../services/apigit.service';
import { SharedDateService } from '../../services/SharedData.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  faBars = faBars
  textSeach:string = ""
  constructor(private apiGit:ApigitService,private SharedData:SharedDateService){
   
  }

  SeachRepositorio(){
    if(this.textSeach != undefined){
      this.apiGit.getRepositoryAll(this.textSeach).subscribe(data => {
        this.SharedData.setSeach(this.textSeach)
        this.SharedData.SetDataCards(data) 
      })
    }
  }

}
