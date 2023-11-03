import { Component } from '@angular/core';
import { ShareDataService } from 'src/app/service/share-data.service';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent {

  constructor(private shareDataService : ShareDataService) {}
  searchTextValue : string = '';

  shareText() {
    this.shareDataService.setSearchText(this.searchTextValue);
  }

  clickedButton(event: any) : void {
    const doc = document.getElementById("mdl");
    const focusMe = document.getElementById("input-text");
    
    if (doc?.classList.contains("modal-hidden")) {
      doc?.classList.remove("modal-hidden");
      doc?.classList.add("modal-show")
      focusMe?.focus();
    } else {
      if (event.srcElement.id != 'input-text') {
        doc?.classList.remove("modal-show");
        doc?.classList.add("modal-hidden");
      }
    }
  }

}
