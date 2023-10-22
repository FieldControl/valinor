import { Component, Input} from '@angular/core';

@Component({
  selector: 'app-user-repository',
  templateUrl: './user-repository.component.html',
  styleUrls: ['./user-repository.component.css']
})
export class UserRepositoryComponent {
    @Input() urlImg:string = ""
    @Input() Name:string = ""
  
}
