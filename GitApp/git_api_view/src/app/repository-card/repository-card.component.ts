import { Component, Input} from '@angular/core';

@Component({
  selector: 'app-repository-card',
  templateUrl: './repository-card.component.html',
  styleUrls: ['./repository-card.component.css']
})
export class RepositoryCardComponent {

   @Input() userInfo:any
   @Input() StarInfo:any
   @Input() RepositoryInfo:any
}
