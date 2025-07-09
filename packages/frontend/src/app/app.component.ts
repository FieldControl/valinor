import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <mat-icon>dashboard</mat-icon>
      <span class="spacer"></span>
      <span>{{ title }}</span>
      <span class="spacer"></span>
      <button mat-icon-button>
        <mat-icon>account_circle</mat-icon>
      </button>
    </mat-toolbar>

    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }

    .main-content {
      padding: 20px;
      min-height: calc(100vh - 64px);
      background-color: #f5f5f5;
    }

    mat-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }
  `]
})
export class AppComponent {
  title = 'Valinor Kanban';
} 