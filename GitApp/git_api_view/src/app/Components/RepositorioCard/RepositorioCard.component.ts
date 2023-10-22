import { Component, Input} from '@angular/core';

@Component({
  selector: 'app-repositorioCard',
  templateUrl: './repositorioCard.component.html',
  styleUrls: ['./repositorioCard.component.css']
})
export class RepositorioCardComponent {

   @Input() userInfo:any
   @Input() StarInfo:any
   @Input() RepositoryInfo:any
}
