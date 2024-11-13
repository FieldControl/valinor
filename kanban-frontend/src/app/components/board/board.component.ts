import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DemoNgZorroAntdModule } from '../../shared/utils/DemoNgZorroAntdModules';
import { ColumnComponent } from '../column/column.component';
import { GET_ALL_BOARDS } from '../../shared/queries/board.queries';
import { Board } from './board.interface';
import { GraphqlService } from '../../shared/graphql/graphql.service';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    DemoNgZorroAntdModule,
    ColumnComponent,
    DragDropModule
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  boards: Board[] = [];
  loading = true;
  error: any;

  constructor(private graphqlService: GraphqlService) {}

  ngOnInit(): void {
    this.graphqlService.query(GET_ALL_BOARDS).subscribe({
      next: (result) => {
        this.boards = result.data.getAllBoards
        .filter((board: { userId: number; }) => board.userId === 3)
        this.loading = false;
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
        this.boards = [];
      },
    });
  }
}
