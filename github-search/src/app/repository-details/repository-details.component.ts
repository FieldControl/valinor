import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-repository-details',
  templateUrl: './repository-details.component.html',
  styleUrls: ['./repository-details.component.css']
})
export class RepositoryDetailsComponent {
  @Input() issues: any[] = [];

}
