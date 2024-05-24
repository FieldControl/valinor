import { Component, OnInit, inject } from '@angular/core';
import { IUser } from '../../core/models/user';
import { UserService } from '../../shared/services/user.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit{
  private userService = inject(UserService)
  users: IUser[] = [];

  ngOnInit(): void {
    this.getUsers()
  }

  getUsers() {
    this.userService.list().subscribe({
      next: (data) => {
        this.users = data;
        console.log('Usuarios', this.users)
      },
      error: (e) => {
        console.log('Erro ao obter usuarios: ',e)
      }
    })
  }
}
