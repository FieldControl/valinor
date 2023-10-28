import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-card-user',
  templateUrl: './card-user.component.html',
  styleUrls: ['./card-user.component.css']
})
export class CardUserComponent {
  @Input() data: any = '';

  constructor(private router: Router) { }

  navigateToUser(username: string) {
    this.router.navigate(['/user', username]);
  }
}
