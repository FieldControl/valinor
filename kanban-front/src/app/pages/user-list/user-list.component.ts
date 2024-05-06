import { Component, OnInit } from '@angular/core';
import { IUser } from '../../models/user';
import { UserService } from '../../services/user.service';
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
  users: IUser[] = [];

  constructor(private userService: UserService){}

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
