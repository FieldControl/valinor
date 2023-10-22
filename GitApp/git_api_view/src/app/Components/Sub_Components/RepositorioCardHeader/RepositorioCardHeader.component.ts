import { Component, Input} from '@angular/core';

@Component({
  selector: 'app-RepositorioCardHeader',
  templateUrl: './RepositorioCardHeader.component.html',
  styleUrls: ['./RepositorioCardHeader.component.css']
})
export class RepositorioCardHeaderComponent {
    @Input() urlImg:string = ""
    @Input() Name:string = ""
  
}
