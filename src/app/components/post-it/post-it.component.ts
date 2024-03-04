import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-post-it',
  standalone: true,
  templateUrl: './post-it.component.html',
  styleUrl: './post-it.component.css'
})
export class PostItComponent {
  @Input() note: string = 'tes'
}
