import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { Subject, switchMap } from 'rxjs';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { ColumnsService } from '../../../../shared/services/columns.service';
import { BoardService } from '../../../../shared/services/board.service';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
    selector: 'app-add-column',
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatInputModule,
        MatButtonModule,
        RouterModule
    ],
    templateUrl: './add-column.component.html',
    styleUrl: './add-column.component.scss'
})
export class AddColumnComponent {
  private readonly matDialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly columnService = inject(ColumnsService);

  private readonly boardService = inject(BoardService);
  private readonly activatedRoute = inject(ActivatedRoute);
  refetch$ = new Subject<void>();
  data = inject(MAT_DIALOG_DATA);

  columnForm = this.fb.group({
    name: this.fb.control(this.data?.column?.name, [Validators.required]),
  });

  addColumn() {
    if (this.columnForm.invalid) {
      return;
    }

    this.columnService
      .createColumn({
        name: this.columnForm.value.name as string,
        order: this.data.board.columns?.length || 0,
        boardId: this.data.board.id,
      })
      .subscribe(() => {
        this.columnForm.reset();
        this.dialogRef.close(true);
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
