import { Component, Input } from '@angular/core';

@Component({
  selector: 'lista-repositorios',
  templateUrl: './repository-list.component.html',
  styleUrls: ['./repository-list.component.css']
})
export class RepositoryListComponent {
  @Input() repositorios: any[] = [];
}
