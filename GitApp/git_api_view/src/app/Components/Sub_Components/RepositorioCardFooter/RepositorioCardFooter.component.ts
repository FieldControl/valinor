import { Component,Input } from '@angular/core';
import { faStar} from '@fortawesome/free-solid-svg-icons'
@Component({
  selector: 'app-RepositorioCardFooter',
  templateUrl: './RepositorioCardFooter.component.html',
  styleUrls: ['./RepositorioCardFooter.component.css']
})
export class RepositorioCardFooter {
  faStar = faStar;
  @Input() descricao:string = ""
  @Input() StarCount:number = 0

}
