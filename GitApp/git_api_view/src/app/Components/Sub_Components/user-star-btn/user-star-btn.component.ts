import { Component } from '@angular/core';
import { faStar} from '@fortawesome/free-solid-svg-icons'
@Component({
  selector: 'app-user-star-btn',
  templateUrl: './user-star-btn.component.html',
  styleUrls: ['./user-star-btn.component.css']
})
export class UserStarBtnComponent {
  faStar = faStar;
  
}
