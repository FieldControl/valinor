import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-repository-item',
  templateUrl: './repository-item.component.html',
  styleUrls: ['./repository-item.component.css']
})

export class RepositoryItemComponent {
  @Input() repository: any;
}
