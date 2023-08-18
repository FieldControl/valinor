import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  projects: any[] = [];

  page = 1;
  count = 0;
  tableSize = 7;
  tableSizes = [3, 6, 9, 12];

  repositorio = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // this.fetchPosts();
  }

  buscarRepositorio(): void {
    this.fetchPosts();
  }

  fetchPosts(): void {
    this.userService.getAllRepo(this.repositorio).subscribe(
      (response) => {
        console.log('Response:', response);
        this.projects = response;
      },
      (error) => {
        alert('Nenhum repositório encontrado');
        console.error(error);
      }
    );
  }

  formatDate(date: string): string {
    const currt = date.split('T');
    return currt[0].split('-').reverse().join('/');
  }

  onTableDataChange(event: any): void {
    this.page = event;
    this.fetchPosts();
  }

  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
    this.fetchPosts();
  }
}
