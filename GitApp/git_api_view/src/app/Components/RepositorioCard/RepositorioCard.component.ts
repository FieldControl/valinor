import { Component, Input} from '@angular/core';
import { card } from 'src/app/Models/Card';
import { faStar} from '@fortawesome/free-solid-svg-icons'

@Component({
  selector: 'app-repositorioCard',
  templateUrl: './RepositorioCard.component.html',
  styleUrls: ['./RepositorioCard.component.css']
})
export class RepositorioCardComponent {
  
   faStar = faStar;
   @Input() Card:any
   
}
