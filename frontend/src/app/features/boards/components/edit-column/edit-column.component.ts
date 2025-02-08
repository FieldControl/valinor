import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import {
  IUpdateColumn,
  IColumn,
} from '../../../../shared/models/board.model';
import { ColumnsService } from '../../../../shared/services/columns.service';
import { ConfirmComponent } from '../../../../shared/ui/confirm/confirm.component';
import { filter, mergeMap } from 'rxjs';

@Component({
    selector: 'app-edit-column',
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatInputModule,
        MatButtonModule,
    ],
    templateUrl: './edit-column.component.html',
    styleUrl: './edit-column.component.scss'
})
export class EditColumnComponent {
  private readonly matDialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly columnService = inject(ColumnsService);
  data = inject(MAT_DIALOG_DATA);

  columnForm = this.fb.group({
    id: this.fb.control(this.data.column.id),
    name: this.fb.control(this.data.column.name, [Validators.required]),
  });

  updateColumn() {
    if (this.columnForm.invalid) {
      return;
    }

    this.columnService
      .updateColumn(this.columnForm.value as IUpdateColumn)
      .subscribe((column: IColumn) => {
        this.dialogRef.close(column);
      });
  }

  deleteColumn() {
    this.matDialog
      .open(ConfirmComponent, {
        data: {
          title: 'Excluir coluna',
          message: 'Tem certeza que deseja excluir essa coluna?',
        },
      })
      .afterClosed()
      .pipe(
        filter((confirm) => confirm),
        mergeMap(() =>
          this.columnService.deleteColumn(this.data.column.id)
        )
      )
      .subscribe(() => {
        this.dialogRef.close(true);
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
