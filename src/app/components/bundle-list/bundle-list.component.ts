import { Component } from '@angular/core';
import { apiService } from 'src/app/service.service';

@Component({
  selector: 'app-bundle-list',
  templateUrl: './bundle-list.component.html',
  styleUrls: ['./bundle-list.component.scss']
})
export class BundleListComponent {
  constructor(public apiService: apiService){}
}
