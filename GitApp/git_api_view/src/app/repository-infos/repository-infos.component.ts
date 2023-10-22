import { Component,Input } from '@angular/core';
import { faStar} from '@fortawesome/free-solid-svg-icons'
@Component({
  selector: 'app-repository-infos',
  templateUrl: './repository-infos.component.html',
  styleUrls: ['./repository-infos.component.css']
})
export class RepositoryInfosComponent {
  faStar = faStar;
  @Input() descricao:string = ""
  @Input() StarCount:number = 0

}
