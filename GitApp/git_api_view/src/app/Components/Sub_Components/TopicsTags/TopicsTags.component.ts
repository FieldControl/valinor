import { Component,ElementRef , AfterViewInit,Input} from '@angular/core';

@Component({
  selector: 'app-TopicsTags',
  templateUrl: './TopicsTags.component.html',
  styleUrls: ['./TopicsTags.component.css']
})
export class CodigoTagComponent{
   @Input() TagText:any;
 
}
