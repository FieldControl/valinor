import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-repositorios-component',
  templateUrl: './repositorios-component.component.html',
  styleUrls: ['./repositorios-component.component.css']
})
export class RepositoriosComponentComponent {
  @Input() repositorios: any = {}
  @Input() pagina: number = 0
}
