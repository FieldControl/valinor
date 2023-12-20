import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Importe o HttpClient
import { Observable } from 'rxjs';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'app';
  searchText: string = '';
  repositories: any[] = [];
  itemsPerPage = 5; // Número de itens por página
  currentPage = 1; // Página atual

  get totalPages(): number {
    return Math.ceil(this.repositories.length / this.itemsPerPage);
  }

  get pagedRepositories(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.repositories.slice(startIndex, endIndex);
  }

  constructor(private httpClient: HttpClient) {}

  searchRepositories() {
    const apiUrl = `https://api.github.com/search/repositories?q=${this.searchText}`;

    this.httpClient.get(apiUrl).subscribe(
      (data: any) => {
        this.repositories = data.items;
        this.currentPage = 1; // Resetar para a primeira página ao realizar uma nova busca
        console.log('Repositórios encontrados:', this.repositories);
      },
      (error) => {
        console.error('Erro ao buscar repositórios:', error);
      }
    );
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}
