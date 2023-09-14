import { Component } from '@angular/core';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-meta-header',
  templateUrl: './meta-header.component.html',
})
export class MetaHeaderComponent {

  constructor(public globalService: GlobalService) {};

}
