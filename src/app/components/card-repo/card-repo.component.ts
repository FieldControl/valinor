import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card',
  templateUrl: './card-repo.component.html',
  styleUrls: ['./card-repo.component.css'],
})

export class CardRepoComponent {
  @Input() data: any = '';

  constructor(private router: Router) { }

  navigateToUser(username: string) {
    this.router.navigate(['/user', username]);
  }
}
