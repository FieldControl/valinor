import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend-angular';

  authenticate : boolean = false

  showHome(){
    if(this.authenticate === false){
      this.authenticate = true;
    }else{
      this.authenticate = false
    };
  }  
}
