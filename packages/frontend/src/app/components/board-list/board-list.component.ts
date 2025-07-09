import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GraphQLService } from '../../services/graphql.service';

@Component({
  selector: 'app-board-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    RouterModule,
  ],
  template: `
    <div class="board-list-container">
      <div class="header">
        <h1>My Kanban Boards</h1>
        <button mat-raised-button color="primary" (click)="createBoard()">
          <mat-icon>add</mat-icon>
          Create Board
        </button>
      </div>

      <div class="boards-grid" *ngIf="!loading">
        <mat-card 
          *ngFor="let board of boards" 
          class="board-card"
          [routerLink]="['/board', board.id]"
        >
          <mat-card-header>
            <mat-card-title>{{ board.title }}</mat-card-title>
            <mat-card-subtitle>{{ board.description }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-actions>
            <button mat-button>Open</button>
            <button mat-icon-button (click)="deleteBoard(board.id, $event)">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div *ngIf="loading" class="loading-container">
        <p>Loading boards...</p>
      </div>
    </div>
  `,
  styles: [`
    .board-list-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .boards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .board-card {
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .board-card:hover {
      transform: translateY(-2px);
    }

    .loading-container {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  `]
})
export class BoardListComponent implements OnInit {
  private graphqlService = inject(GraphQLService);
  private dialog = inject(MatDialog);
  
  boards: any[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadBoards();
  }

  loadBoards(): void {
    console.log('Loading boards...');
    this.loading = true;
    this.graphqlService.getBoards().subscribe({
      next: (response) => {
        console.log('Boards loaded successfully:', response);
        this.boards = response.boards || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading boards:', error);
        this.loading = false;
        // Fallback to sample data if backend is not available
        console.log('Using fallback sample data');
        this.boards = [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'My First Kanban Board',
            description: 'A sample board to get started with the Kanban application'
          }
        ];
      }
    });
  }

  createBoard(): void {
    console.log('Create board button clicked!');
    const title = prompt('Enter board title:');
    console.log('Title entered:', title);
    
    if (title) {
      const description = prompt('Enter board description (optional):') || '';
      console.log('Description entered:', description);
      
      console.log('Calling GraphQL service...');
      this.graphqlService.createBoard(title, description).subscribe({
        next: (response) => {
          console.log('Board created successfully:', response);
          alert('Board created successfully!');
          this.loadBoards(); // Refresh the list
        },
        error: (error) => {
          console.error('Error creating board:', error);
          alert('Failed to create board. Please check console for details.');
        }
      });
    } else {
      console.log('No title entered, board creation cancelled.');
    }
  }

  deleteBoard(boardId: string, event: Event): void {
    console.log('Delete board clicked for ID:', boardId);
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this board?')) {
      console.log('Delete confirmed, calling GraphQL service...');
      this.graphqlService.deleteBoard(boardId).subscribe({
        next: (response) => {
          console.log('Board deleted successfully:', response);
          alert('Board deleted successfully!');
          this.loadBoards(); // Refresh the list
        },
        error: (error) => {
          console.error('Error deleting board:', error);
          alert('Failed to delete board. Please check console for details.');
        }
      });
    } else {
      console.log('Delete cancelled by user.');
    }
  }
} 