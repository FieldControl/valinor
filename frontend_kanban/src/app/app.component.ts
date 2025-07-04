import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Column } from './components/column/column';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class App implements OnInit{
  data: any[] = [];
  private API_URL = 'http://localhost:3000';
  protected title = 'frontend_kanban';
  
  constructor(private http: HttpClient){}

  ngOnInit() {
    this.fetchData();
  }

  fetchData(){
    this.http.get<any[]>(`${this.API_URL}/column`).subscribe({
      next: (response) => {
        this.data = response;
        console.log('Data received: ', this.data);
      },
      error: (error) =>{
        console.log('Error to find data: ', error)
      }
    });
  }
}
