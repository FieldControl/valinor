import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Kanban Chalenge';

  authenticate : boolean = false

  showHome(){
    if(this.authenticate === false){
      this.authenticate = true;
    }else{
      this.authenticate = false
    };
  }  
}
