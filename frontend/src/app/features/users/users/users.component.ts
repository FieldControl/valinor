import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { UsersApiService }   from '../../../core/api/users-api.service';
import { User }              from '../../../shared/models/user.model';

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

  constructor(private usersApi: UsersApiService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.usersApi.getAll().subscribe(list => {
      this.users = list;
    });
  }

  changeRole(user: User, newRole: number) {
    this.usersApi.updateRole(user.id, newRole)
      .subscribe(updated => {
        user.tipo = updated.tipo;
      });
  }

  getRoleLabel(tipo: number): string {
    const found = this.roles.find(r => r.value === tipo);
    return found ? found.label : 'Unknown';
  }
}
