import { Component, OnInit }   from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';
import { AuthService }         from '../../../core/auth/auth.service';

interface User { id: number; name: string; email: string; tipo: number; }

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  roles = [
    { value: 0, label: 'Admin' },
    { value: 1, label: 'Editor' },
    { value: 2, label: 'Viewer' },
    { value: 3, label: 'None' },
  ];

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.users = this.auth.getAllUsers(); // ou via novo UsersService
  }

  changeRole(user: User, newRole: number) {
    user.tipo = newRole;
    this.auth.updateRole(user.id, newRole)
      .subscribe(); // adaptar à sua API
  }
}
