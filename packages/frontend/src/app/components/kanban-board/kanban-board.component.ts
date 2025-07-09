import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { GraphQLService } from '../../services/graphql.service';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    FormsModule,
    DragDropModule
  ],
  template: `
    <div class="kanban-board-container">
      <nav class="breadcrumb">
        <a (click)="navigateToBoards()" class="breadcrumb-link" 
           matTooltip="Back to all boards (Alt+B)" 
           matTooltipPosition="below">
          <mat-icon>dashboard</mat-icon>
          <span>All Boards</span>
        </a>
        <mat-icon class="breadcrumb-separator">chevron_right</mat-icon>
        <span class="breadcrumb-current">{{ board?.title || 'Loading...' }}</span>
      </nav>
      
      <div class="board-header">
        <div class="board-title-section">
          <button mat-icon-button (click)="navigateToBoards()" 
                  matTooltip="Back to boards (Alt+B)" 
                  matTooltipPosition="right"
                  title="Back to boards" 
                  class="back-button">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>{{ board?.title || 'Loading...' }}</h1>
        </div>
        <div class="board-actions">
          <button mat-raised-button color="primary" (click)="addColumn()">
            <mat-icon>add</mat-icon>
            Add Column
          </button>
          <button mat-raised-button (click)="loadBoard()" title="Refresh board">
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
        </div>
      </div>

      <div class="kanban-board" *ngIf="!loading" 
           cdkDropList 
           cdkDropListOrientation="horizontal"
           [cdkDropListData]="columns"
           (cdkDropListDropped)="dropColumn($event)">
        
        <div class="kanban-column" 
             *ngFor="let column of columns; trackBy: trackByColumnId"
             cdkDrag
             [cdkDragData]="column">
          
          <!-- Drag Handle for Column -->
          <div class="column-drag-handle" cdkDragHandle>
            <mat-icon>drag_indicator</mat-icon>
          </div>
          
          <!-- Column Header -->
          <mat-card class="column-header">
            <div class="column-title" *ngIf="!column.editing; else editColumnTitle">
              <h3>{{ column.title }}</h3>
              <div class="column-actions">
                <button mat-icon-button (click)="editColumn(column)" title="Edit column">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="deleteColumn(column.id)" title="Delete column" color="warn">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
            <ng-template #editColumnTitle>
              <div class="edit-column-form">
                <mat-form-field appearance="outline">
                  <input matInput [(ngModel)]="column.tempTitle" placeholder="Column title">
                </mat-form-field>
                <div class="form-actions">
                  <button mat-icon-button (click)="saveColumn(column)" color="primary">
                    <mat-icon>save</mat-icon>
                  </button>
                  <button mat-icon-button (click)="cancelEditColumn(column)">
                    <mat-icon>cancel</mat-icon>
                  </button>
                </div>
              </div>
            </ng-template>
          </mat-card>

          <!-- Cards Drop List -->
          <div class="cards-container"
               cdkDropList
               [id]="'cards-' + column.id"
               [cdkDropListData]="column.cards"
               [cdkDropListConnectedTo]="getConnectedDropLists()"
               (cdkDropListDropped)="dropCard($event)"
               (cdkDropListEntered)="onDragStarted()"
               (cdkDropListExited)="onDragEnded()">
            
            <mat-card class="kanban-card" 
                      *ngFor="let card of column.cards; trackBy: trackByCardId"
                      cdkDrag
                      [cdkDragData]="card"
                      (cdkDragStarted)="onDragStarted()"
                      (cdkDragEnded)="onDragEnded()">
              
              <!-- Card Drag Preview -->
              <div class="drag-preview" *cdkDragPreview>
                <mat-card class="kanban-card preview-card">
                  <mat-card-header>
                    <mat-card-title>{{ card.title }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <p>{{ card.description }}</p>
                    <div class="card-meta" *ngIf="card.color">
                      <span class="color-indicator" [style.background-color]="card.color"></span>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <!-- Card Placeholder when dragging -->
              <div class="drag-placeholder" *cdkDragPlaceholder>
                <div class="placeholder-content">
                  <mat-icon>more_horiz</mat-icon>
                  <span>Drop card here</span>
                </div>
              </div>

              <!-- Card Content -->
              <div *ngIf="!card.editing; else editCardTemplate">
                <mat-card-header>
                  <mat-card-title>{{ card.title }}</mat-card-title>
                  <div class="card-actions">
                    <button mat-icon-button (click)="editCard(card)" title="Edit card">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button (click)="deleteCard(card.id)" title="Delete card" color="warn">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </mat-card-header>
                <mat-card-content>
                  <p>{{ card.description }}</p>
                  <div class="card-meta" *ngIf="card.color">
                    <span class="color-indicator" [style.background-color]="card.color"></span>
                  </div>
                </mat-card-content>
              </div>
              
              <ng-template #editCardTemplate>
                <div class="edit-card-form">
                  <mat-form-field appearance="outline">
                    <input matInput [(ngModel)]="card.tempTitle" placeholder="Card title">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <textarea matInput [(ngModel)]="card.tempDescription" placeholder="Card description" rows="3"></textarea>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <input matInput [(ngModel)]="card.tempColor" placeholder="Color (e.g., #FF5733)" type="color">
                  </mat-form-field>
                  <div class="form-actions">
                    <button mat-button (click)="saveCard(card)" color="primary">Save</button>
                    <button mat-button (click)="cancelEditCard(card)">Cancel</button>
                  </div>
                </div>
              </ng-template>
            </mat-card>

            <!-- Drop Zone Indicator -->
            <div class="drop-zone-indicator" 
                 [class.drop-zone-active]="isDragActive">
              <mat-icon>add_circle_outline</mat-icon>
              <span>Drop card here</span>
            </div>

            <!-- Add Card Button -->
            <button mat-stroked-button class="add-card-btn" (click)="addCard(column.id)">
              <mat-icon>add</mat-icon>
              Add Card
            </button>
          </div>
        </div>

        <!-- Add Column Placeholder -->
        <div class="add-column-placeholder" *ngIf="columns.length === 0">
          <p>No columns yet. Click "Add Column" to get started!</p>
        </div>
      </div>

      <div class="loading-container" *ngIf="loading">
        <p>Loading board...</p>
      </div>
    </div>
  `,
  styles: [`
    .kanban-board-container {
      padding: 20px;
      max-width: 100vw;
      overflow-x: hidden;
    }

    .board-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .board-title-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .back-button {
      transition: all 0.3s ease;
    }

    .back-button:hover {
      background-color: #f5f5f5;
      transform: translateX(-2px);
    }

    .board-header h1 {
      margin: 0;
      color: #333;
    }

    .board-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    /* Kanban Board Container */
    .kanban-board {
      display: flex;
      gap: 20px;
      overflow-x: auto;
      padding-bottom: 20px;
      min-height: 600px;
    }

    /* Column Styles */
    .kanban-column {
      min-width: 320px;
      max-width: 320px;
      display: flex;
      flex-direction: column;
      background: #f8f9fa;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .kanban-column:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }

    /* Column Drag Handle */
    .column-drag-handle {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 32px;
      background: #e3f2fd;
      border-radius: 12px 12px 0 0;
      cursor: grab;
      transition: all 0.2s ease;
      border-bottom: 1px solid #bbdefb;
    }

    .column-drag-handle:hover {
      background: #bbdefb;
    }

    .column-drag-handle:active {
      cursor: grabbing;
      background: #90caf9;
    }

    .column-drag-handle mat-icon {
      color: #1976d2;
      font-size: 18px;
    }

    .column-header {
      margin: 0 16px 16px 16px;
      padding: 16px;
      background: white;
      border-radius: 8px;
    }

    .column-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .column-title h3 {
      margin: 0;
      color: #333;
      font-weight: 500;
    }

    .column-actions {
      display: flex;
      gap: 4px;
    }

    .edit-column-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .form-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    /* Cards Container */
    .cards-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 120px;
      padding: 0 16px 16px 16px;
      position: relative;
    }

    /* Card Styles */
    .kanban-card {
      margin: 0;
      cursor: grab;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: center;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .kanban-card:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .kanban-card:active {
      cursor: grabbing;
    }

    /* CDK Drag States */
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 8px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.3);
      transform: rotate(5deg);
      opacity: 0.9;
    }

    .cdk-drag-placeholder {
      opacity: 0.4;
      background: #e3f2fd;
      border: 2px dashed #2196f3;
      border-radius: 8px;
      min-height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 1.5s ease-in-out infinite;
    }

    .cdk-drag-animating {
      transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drop-list-dragging .cdk-drag {
      transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);
    }

    /* Drag Placeholder */
    .drag-placeholder {
      background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
      border: 2px dashed #2196f3;
      border-radius: 8px;
      min-height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 8px 0;
    }

    .placeholder-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: #1976d2;
      font-weight: 500;
    }

    .placeholder-content mat-icon {
      font-size: 24px;
      opacity: 0.7;
    }

    /* Preview Card */
    .preview-card {
      max-width: 300px;
      transform: rotate(3deg);
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }

    /* Drop Zone Indicator */
    .drop-zone-indicator {
      display: none;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 60px;
      background: linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%);
      border: 2px dashed #4caf50;
      border-radius: 8px;
      color: #2e7d32;
      font-weight: 500;
      margin: 8px 0;
      transition: all 0.3s ease;
    }

    .drop-zone-indicator.drop-zone-active,
    .cdk-drop-list-receiving .drop-zone-indicator {
      display: flex;
      animation: bounceIn 0.5s ease;
    }

    .drop-zone-indicator mat-icon {
      font-size: 20px;
    }

    /* Enhanced Drop List States */
    .cdk-drop-list-receiving {
      background: linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%);
      border: 2px solid #4caf50;
      border-radius: 12px;
      transform: scale(1.02);
    }

    .cdk-drop-list-dragging {
      opacity: 0.7;
    }

    /* Column Drop States */
    .kanban-board.cdk-drop-list-receiving {
      background: linear-gradient(135deg, #fef7e0 0%, #fff3e0 100%);
    }

    /* Card Actions */
    .kanban-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .card-actions {
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .kanban-card:hover .card-actions {
      opacity: 1;
    }

    .edit-card-form {
      padding: 16px;
    }

    .edit-card-form mat-form-field {
      width: 100%;
      margin-bottom: 12px;
    }

    .card-meta {
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .color-indicator {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }

    .add-card-btn {
      width: 100%;
      padding: 12px;
      border: 2px dashed #ccc;
      background: transparent;
      color: #666;
      transition: all 0.2s ease;
      border-radius: 8px;
    }

    .add-card-btn:hover {
      border-color: #2196f3;
      color: #2196f3;
      background: rgba(33, 150, 243, 0.04);
      transform: translateY(-1px);
    }

    .add-column-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      color: #666;
      font-style: italic;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
      color: #666;
    }

    /* Animations */
    @keyframes pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }

    @keyframes bounceIn {
      0% { opacity: 0; transform: scale(0.3); }
      50% { opacity: 1; transform: scale(1.05); }
      70% { transform: scale(0.95); }
      100% { opacity: 1; transform: scale(1); }
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    /* Enhanced Visual Feedback */
    .kanban-column.cdk-drag-preview {
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      transform: rotate(2deg);
    }

    .kanban-column.cdk-drag-placeholder {
      background: #e3f2fd;
      border: 2px dashed #2196f3;
      opacity: 0.5;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .kanban-board-container {
        padding: 12px;
      }

      .breadcrumb {
        font-size: 12px;
        margin-bottom: 12px;
      }

      .breadcrumb-link {
        padding: 2px 6px;
      }

      .breadcrumb-link span {
        display: none; /* Hide text on mobile, show only icon */
      }

      .board-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .board-title-section {
        gap: 8px;
      }

      .board-title-section h1 {
        font-size: 1.5rem;
      }

      .kanban-column {
        min-width: 280px;
        max-width: 280px;
      }

      .kanban-card:hover {
        transform: translateY(-2px) scale(1.01);
      }
    }

    /* Focus States for Accessibility */
    .cdk-drag:focus {
      outline: 2px solid #2196f3;
      outline-offset: 2px;
    }

    .cdk-drop-list:focus {
      outline: 2px solid #4caf50;
      outline-offset: 2px;
    }

    /* Breadcrumb Navigation */
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
      font-size: 14px;
      color: #666;
    }

    .breadcrumb-link {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #1976d2;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .breadcrumb-link:hover {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    .breadcrumb-link mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .breadcrumb-separator {
      color: #bbb;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .breadcrumb-current {
      font-weight: 500;
      color: #333;
    }
  `]
})
export class KanbanBoardComponent implements OnInit {
  private graphqlService = inject(GraphQLService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  boardId: string = '';
  board: any = null;
  columns: any[] = [];
  loading = false;

  // Component state for drag operations
  isDragActive = false;
  connectedDropLists: string[] = [];

  ngOnInit(): void {
    this.boardId = this.route.snapshot.paramMap.get('id') || '';
    console.log('KanbanBoard initialized with boardId:', this.boardId);
    if (this.boardId) {
      this.loadBoard();
    }
  }

  trackByColumnId(index: number, column: any): string {
    return column.id;
  }

  trackByCardId(index: number, card: any): string {
    return card.id;
  }

  loadBoard(): void {
    console.log('Loading board with ID:', this.boardId);
    this.loading = true;
    
    this.graphqlService.getBoardWithDetails(this.boardId).subscribe({
      next: (response: any) => {
        console.log('Board loaded for ID:', this.boardId);
        console.log('Board response:', response);
        console.log('Raw columns from API:', response.board?.columns);
        
        this.board = response.board;
        this.columns = response.board?.columns || [];
        
        // Ensure columns are sorted by position
        this.columns.sort((a, b) => a.position - b.position);
        
        // Log column details to debug position issues
        console.log(`Columns for board ${this.boardId} after assignment and sorting:`);
        this.columns.forEach((col, index) => {
          console.log(`  [${index}] ${col.title} - id: ${col.id}, position: ${col.position}, board_id: ${col.board_id}`);
        });
        
        // Cards are already nested under each column from the GraphQL response
        this.updateConnectedDropLists();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading board with ID:', this.boardId, error);
        this.loading = false;
        // Fallback to sample data for testing
        this.loadSampleData();
        this.updateConnectedDropLists();
      }
    });
  }

  updateConnectedDropLists(): void {
    this.connectedDropLists = this.columns.map(column => `cards-${column.id}`);
  }

  getConnectedDropLists(): string[] {
    return this.connectedDropLists;
  }

  // Drag and Drop Event Handlers
  dropColumn(event: CdkDragDrop<any[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      console.log('Column drop event:', {
        previousIndex: event.previousIndex,
        currentIndex: event.currentIndex,
        columnsCount: this.columns.length
      });

      // Get the column that was moved BEFORE moving it locally
      const columnToMove = this.columns[event.previousIndex];
      console.log('Column to move:', {
        id: columnToMove.id,
        title: columnToMove.title,
        currentPosition: columnToMove.position,
        fromIndex: event.previousIndex,
        toIndex: event.currentIndex
      });

      // The new position should be the target index
      const newPosition = event.currentIndex;
      
      console.log('Calling moveColumn with:', {
        columnId: columnToMove.id,
        newPosition: newPosition,
        previousIndex: event.previousIndex,
        currentIndex: event.currentIndex
      });
      
      // Move column locally first for immediate UI feedback
      moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
      
      // Update local position values to match the new order
      this.columns.forEach((col, index) => {
        col.position = index;
      });
      
      // Call the backend to update the database
      this.graphqlService.moveColumn(columnToMove.id, newPosition).subscribe({
        next: (response: any) => {
          console.log('Column moved successfully:', response);
          // Don't reload the board - the local state is already correct
          // Only reload if there's an error to ensure consistency
        },
        error: (error: any) => {
          console.error('Error moving column:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          // Revert the local change and reload to get correct state
          this.loadBoard();
          alert('Failed to move column. Please try again.');
        }
      });
    }
  }

  dropCard(event: CdkDragDrop<any[]>): void {
    this.isDragActive = false;
    
    if (event.previousContainer === event.container) {
      // Moving within the same column
      if (event.previousIndex !== event.currentIndex) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        
        const cardToMove = event.container.data[event.currentIndex];
        console.log('Moving card within column:', cardToMove.title, 'to position:', event.currentIndex);
        
        this.graphqlService.moveCard(cardToMove.id, cardToMove.columnId, event.currentIndex).subscribe({
          next: (response: any) => {
            console.log('Card moved within column successfully:', response);
          },
          error: (error: any) => {
            console.error('Error moving card within column:', error);
            // Revert the local change on error
            moveItemInArray(event.container.data, event.currentIndex, event.previousIndex);
            alert('Failed to move card. Please try again.');
          }
        });
      }
    } else {
      // Moving between columns
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      const cardToMove = event.container.data[event.currentIndex];
      const targetColumn = this.getColumnFromDropListId(event.container.id);
      
      if (targetColumn) {
        console.log('Moving card between columns:', cardToMove.title, 'to column:', targetColumn.title);
        
        this.graphqlService.moveCard(cardToMove.id, targetColumn.id, event.currentIndex).subscribe({
          next: (response: any) => {
            console.log('Card moved between columns successfully:', response);
            // Update the card's columnId locally
            cardToMove.columnId = targetColumn.id;
          },
          error: (error: any) => {
            console.error('Error moving card between columns:', error);
            // Revert the local change on error
            transferArrayItem(
              event.container.data,
              event.previousContainer.data,
              event.currentIndex,
              event.previousIndex
            );
            alert('Failed to move card. Please try again.');
          }
        });
      }
    }
  }

  private getColumnFromDropListId(dropListId: string): any {
    const columnId = dropListId.replace('cards-', '');
    return this.columns.find(col => col.id === columnId);
  }

  onDragStarted(): void {
    this.isDragActive = true;
  }

  onDragEnded(): void {
    this.isDragActive = false;
  }

  loadSampleData(): void {
    this.board = { id: this.boardId, title: 'Sample Board' };
    this.columns = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'To Do',
        boardId: this.boardId,
        position: 0,
        cards: [
          {
            id: '550e8400-e29b-41d4-a716-446655440004',
            title: 'Setup Development Environment',
            description: 'Configure Angular and NestJS development environment',
            columnId: '550e8400-e29b-41d4-a716-446655440001',
            color: '#FF6B6B'
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440005',
            title: 'Create Database Schema',
            description: 'Design and implement the Supabase database schema',
            columnId: '550e8400-e29b-41d4-a716-446655440001',
            color: '#4ECDC4'
          }
        ]
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'In Progress',
        boardId: this.boardId,
        position: 1,
        cards: [
          {
            id: '550e8400-e29b-41d4-a716-446655440006',
            title: 'Build Backend API',
            description: 'Implement NestJS GraphQL API with all CRUD operations',
            columnId: '550e8400-e29b-41d4-a716-446655440002',
            color: '#45B7D1'
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440007',
            title: 'Design UI Components',
            description: 'Create Angular components for Kanban board interface',
            columnId: '550e8400-e29b-41d4-a716-446655440002',
            color: '#96CEB4'
          }
        ]
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        title: 'Done',
        boardId: this.boardId,
        position: 2,
        cards: [
          {
            id: '550e8400-e29b-41d4-a716-446655440008',
            title: 'Project Planning',
            description: 'Define requirements and create project roadmap',
            columnId: '550e8400-e29b-41d4-a716-446655440003',
            color: '#FFEAA7'
          }
        ]
      }
    ];
  }

  // Column CRUD Operations
  addColumn(): void {
    const title = prompt('Enter column title:');
    if (title) {
      console.log('Creating column:', title);
      const position = this.columns.length;
      
      this.graphqlService.createColumn(this.boardId, title, position).subscribe({
        next: (response: any) => {
          console.log('Column created:', response);
          this.loadBoard();
        },
        error: (error: any) => {
          console.error('Error creating column:', error);
          alert('Failed to create column. Please try again.');
        }
      });
    }
  }

  editColumn(column: any): void {
    column.editing = true;
    column.tempTitle = column.title;
  }

  saveColumn(column: any): void {
    if (column.tempTitle && column.tempTitle.trim()) {
      console.log('Updating column:', column.id, column.tempTitle);
      
      this.graphqlService.updateColumn(column.id, column.tempTitle.trim()).subscribe({
        next: (response: any) => {
          console.log('Column updated:', response);
          column.title = column.tempTitle;
          column.editing = false;
        },
        error: (error: any) => {
          console.error('Error updating column:', error);
          alert('Failed to update column. Please try again.');
        }
      });
    }
  }

  cancelEditColumn(column: any): void {
    column.editing = false;
    column.tempTitle = column.title;
  }

  deleteColumn(columnId: string): void {
    if (confirm('Are you sure you want to delete this column and all its cards?')) {
      console.log('Deleting column:', columnId);
      
      this.graphqlService.deleteColumn(columnId).subscribe({
        next: (response: any) => {
          console.log('Column deleted:', response);
          this.loadBoard();
        },
        error: (error: any) => {
          console.error('Error deleting column:', error);
          alert('Failed to delete column. Please try again.');
        }
      });
    }
  }

  // Card CRUD Operations
  addCard(columnId: string): void {
    const title = prompt('Enter card title:');
    if (title) {
      const description = prompt('Enter card description (optional):') || '';
      const color = prompt('Enter card color (e.g., #FF5733, optional):') || '#E0E0E0';
      
      console.log('Creating card:', { title, description, columnId, color });
      
      const column = this.columns.find(col => col.id === columnId);
      const position = column ? column.cards.length : 0;
      
      this.graphqlService.createCard(columnId, title, description, position, color).subscribe({
        next: (response: any) => {
          console.log('Card created:', response);
          this.loadBoard();
        },
        error: (error: any) => {
          console.error('Error creating card:', error);
          alert('Failed to create card. Please try again.');
        }
      });
    }
  }

  editCard(card: any): void {
    card.editing = true;
    card.tempTitle = card.title;
    card.tempDescription = card.description;
    card.tempColor = card.color || '#E0E0E0';
  }

  saveCard(card: any): void {
    if (card.tempTitle && card.tempTitle.trim()) {
      console.log('Updating card:', card.id, {
        title: card.tempTitle,
        description: card.tempDescription,
        color: card.tempColor
      });
      
      this.graphqlService.updateCard(
        card.id,
        card.tempTitle.trim(),
        card.tempDescription || '',
        card.tempColor || '#E0E0E0'
      ).subscribe({
        next: (response: any) => {
          console.log('Card updated:', response);
          card.title = card.tempTitle;
          card.description = card.tempDescription;
          card.color = card.tempColor;
          card.editing = false;
        },
        error: (error: any) => {
          console.error('Error updating card:', error);
          alert('Failed to update card. Please try again.');
        }
      });
    }
  }

  cancelEditCard(card: any): void {
    card.editing = false;
    card.tempTitle = card.title;
    card.tempDescription = card.description;
    card.tempColor = card.color;
  }

  deleteCard(cardId: string): void {
    if (confirm('Are you sure you want to delete this card?')) {
      console.log('Deleting card:', cardId);
      
      this.graphqlService.deleteCard(cardId).subscribe({
        next: (response: any) => {
          console.log('Card deleted:', response);
          this.loadBoard();
        },
        error: (error: any) => {
          console.error('Error deleting card:', error);
          alert('Failed to delete card. Please try again.');
        }
      });
    }
  }

  navigateToBoards(): void {
    this.router.navigate(['/']);
  }

  // Keyboard shortcut handler
  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent): void {
    // Alt + B to go back to boards
    if (event.altKey && event.key === 'b') {
      event.preventDefault();
      this.navigateToBoards();
    }
  }
} 